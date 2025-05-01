import { format } from "date-fns";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { getRefundFailedReason } from "@/lib/functions";
import { sendReturnOrderEmail, sendStoreReturnOrderEmail } from "@/lib/mail";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string; returnRequestId: string }> }
) {
  try {
    const { orderId, returnRequestId } = await params;

    if (!orderId) {
      return new Response("Order Id is required", { status: 400 });
    }

    if (!returnRequestId) {
      return new Response("Return request Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new Response("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user role is user

    if (user.role !== UserRole.ADMIN) {
      return new Response(
        "Unauthorized, Only admin can accept refund request",
        {
          status: 401,
        }
      );
    }

    //check if order exists
    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        paymentIntentId: true,
        status: true,
        createdAt: true,
      },
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    //check if order status is RETURNREQUESTED
    if (order.status !== OrderStatus.RETURNREQUESTED) {
      return new Response("You order status is not return request!", {
        status: 401,
      });
    }

    //check if return request exists
    const returnRequest = await prismadb.returnRequest.findUnique({
      where: {
        id: returnRequestId,
        orderId,
      },
      select: {
        reason: true,
        returnItems: {
          select: {
            orderitem: {
              select: {
                quantity: true,
                store: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
                product: {
                  select: {
                    name: true,
                  },
                },
                availableItem: {
                  select: {
                    id: true,
                    currentPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!returnRequest) {
      return new Response("Return request not found!", { status: 404 });
    }

    //Get refund amount.
    const refundAmount =
      returnRequest?.returnItems?.reduce(
        (total, item) =>
          total +
          item.orderitem.availableItem.currentPrice * item.orderitem.quantity,
        0
      ) * 100;

    //Refund Order item.
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId as string,
      amount: refundAmount,
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

    //Send confirmation to user and store.
    await sendReturnOrderEmail({
      email: order.user.email || "",
      username: order.user.name || "",
      orderId,
      orderDate: `${format(order.createdAt, "MMMM do, yyyy")}`,
      totalAmount: `${formatPrice(
        returnRequest?.returnItems?.reduce(
          (total, item) =>
            total +
            item.orderitem.availableItem.currentPrice * item.orderitem.quantity,
          0
        ),
        {
          currency: "GBP",
        }
      )}`,
    });

    await Promise.all(
      returnRequest.returnItems.map(async (item) => {
        await sendStoreReturnOrderEmail({
          email: item.orderitem.store.email || "",
          storeName: item.orderitem.store.name || "",
          orderId,
          orderDate: `${format(order.createdAt, "MMMM do, yyyy")}`,
          item: `${item.orderitem.product.name} (Qty: ${
            item.orderitem.quantity
          }), price: ${formatPrice(item.orderitem.availableItem.currentPrice, {
            currency: "GBP",
          })}`,
          reason: returnRequest.reason,
        });
      })
    );

    //Update Order status.
    await prismadb.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.REFUNDED,
      },
    });

    //Update number of product in stocks for each order item.
    const orderItems = returnRequest.returnItems.map((item) => item.orderitem);

    await Promise.all(
      orderItems.map(async (orderItem) => {
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

    return Response.json({
      message: "Your return request has been accepted!",
    });
  } catch (err) {
    console.log("[RETURN_REQUEST_ACCEPT]", err);

    // Handle Stripe specific errors
    if (err instanceof stripe.errors.StripeError) {
      console.log(`Stripe error occurred: ${err.message}`);

      return new Response(`Stripe Error: ${err.message}`, { status: 400 });
    }

    return new Response("Internal Error", { status: 500 });
  }
}
