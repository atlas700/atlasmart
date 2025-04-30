import { format } from "date-fns";
import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { OrderStatus, UserRole } from "@prisma/client";
import { getRefundFailedReason } from "@/lib/functions";
import { sendCancelOrderEmail, sendStoreCancelOrderEmail } from "@/lib/mail";

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return new NextResponse("Order Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user role is user
    if (user.role !== UserRole.USER) {
      return new NextResponse("Unauthorized, Only users can cancel orders", {
        status: 401,
      });
    }

    //check if order exists
    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
              },
            },
            store: {
              select: {
                email: true,
                name: true,
              },
            },
            quantity: true,
            availableItem: {
              select: {
                id: true,
                currentPrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found!", { status: 404 });
    }

    //Cancel Order.
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId as string,
    });

    if (refund.status !== "succeeded") {
      return new NextResponse(
        `Refund was unsuccessful, reason: ${getRefundFailedReason(
          refund.failure_reason
        )}`,
        {
          status: 400,
        }
      );
    }

    //Send confirmation email to customer and store.
    const totalAmount = order?.orderItems?.reduce(
      (total, item) =>
        total + item.availableItem?.currentPrice * item?.quantity,
      0
    );

    await sendCancelOrderEmail({
      email: user.email || "",
      username: user.name || "",
      orderId: order.id,
      orderDate: `${format(order.createdAt, "MMMM do, yyyy")}`,
      totalAmount: `${formatPrice(totalAmount, { currency: "GBP" })}`,
    });

    await Promise.all(
      order.orderItems.map(async (item) => {
        await sendStoreCancelOrderEmail({
          email: item.store.email || "",
          storeName: item.store.name || "",
          orderId: order.id,
          orderDate: `${format(order.createdAt, "MMMM do, yyyy")}`,
          item: `${item.product.name} (Qty: ${
            item.quantity
          }), price: ${formatPrice(item.availableItem.currentPrice, {
            currency: "GBP",
          })}`,
        });
      })
    );

    //Update Order status.
    await prismadb.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    //Update number of product in stocks for each order item.
    await Promise.all(
      order.orderItems.map(async (orderItem) => {
        await prismadb.available.update({
          where: {
            id: orderItem.availableItem.id,
          },
          data: {
            numInStocks: {
              increment: orderItem.quantity,
            },
          },
        });
      })
    );

    return NextResponse.json({
      message: "Order has been cancelled and refunded!",
    });
  } catch (err) {
    console.log("[CANCEL_ORDER]", err);

    // Handle Stripe specific errors
    if (err instanceof stripe.errors.StripeError) {
      console.log(`Stripe error occurred: ${err.message}`);

      return new NextResponse(`Stripe Error: ${err.message}`, { status: 400 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}
