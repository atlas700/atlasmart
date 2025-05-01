import { format } from "date-fns";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { getRefundFailedReason } from "@/lib/functions";
import { sendCancelOrderEmail, sendStoreCancelOrderEmail } from "@/lib/mail";
import { getCurrentUser } from "@/services/clerk";
import {
  AvailableItemTable,
  orderStatuses,
  OrderTable,
  userRoles,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return new Response("Order Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user role is user
    if (user.role !== userRoles[0]) {
      return new Response("Unauthorized, Only users can cancel orders", {
        status: 401,
      });
    }

    //check if order exists
    const order = await db.query.OrderTable.findFirst({
      where: and(eq(OrderTable.id, orderId), eq(OrderTable.userId, user.id)),
      with: {
        orderItems: {
          columns: {
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
            store: {
              columns: {
                email: true,
                name: true,
              },
            },
            availableItem: {
              columns: {
                id: true,
                currentPrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    //Cancel Order.
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId as string,
    });

    if (refund.status !== "succeeded") {
      return new Response(
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
      totalAmount: `${formatPrice(totalAmount, { currency: "USD" })}`,
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
            currency: "USD",
          })}`,
        });
      })
    );

    //Update Order status.
    await db
      .update(OrderTable)
      .set({
        status: orderStatuses[7],
      })
      .where(eq(OrderTable.id, order.id));

    //Update number of product in stocks for each order item.
    await Promise.all(
      order.orderItems.map(async (orderItem) => {
        await db
          .update(AvailableItemTable)
          .set({
            numInStocks: orderItem.quantity + 1,
          })
          .where(eq(AvailableItemTable.id, orderItem.availableItem.id));
      })
    );

    return new Response(
      JSON.stringify({
        message: "Order has been cancelled and refunded!",
      })
    );
  } catch (err) {
    console.log("[CANCEL_ORDER]", err);

    // Handle Stripe specific errors
    if (err instanceof stripe.errors.StripeError) {
      console.log(`Stripe error occurred: ${err.message}`);

      return new Response(`Stripe Error: ${err.message}`, { status: 400 });
    }

    return new Response("Internal Error", { status: 500 });
  }
}
