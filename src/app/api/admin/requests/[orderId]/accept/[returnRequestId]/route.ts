import { format } from "date-fns";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { getRefundFailedReason } from "@/lib/functions";
import { sendReturnOrderEmail, sendStoreReturnOrderEmail } from "@/lib/mail";
import { getCurrentUser } from "@/services/clerk";
import {
  AvailableItemTable,
  OrderItemTable,
  orderStatuses,
  OrderTable,
  ReturnRequestTable,
  userRoles,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

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
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user role is user

    if (user.role !== userRoles[1]) {
      return new Response(
        "Unauthorized, Only admin can accept refund request",
        {
          status: 401,
        }
      );
    }

    //check if order exists
    const order = await db.query.OrderTable.findFirst({
      where: eq(OrderTable.id, orderId),
      columns: {
        id: true,
        paymentIntentId: true,
        status: true,
        createdAt: true,
      },
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    //check if order status is RETURNREQUESTED
    if (order.status !== orderStatuses[8]) {
      return new Response("You order status is not return request!", {
        status: 401,
      });
    }

    //check if return request exists
    const returnRequest = await db.query.ReturnRequestTable.findFirst({
      where: and(
        eq(ReturnRequestTable.id, returnRequestId),
        eq(ReturnRequestTable.orderId, orderId)
      ),
      columns: {
        reason: true,
      },
      with: {
        returnItems: {
          with: {
            orderItem: {
              columns: {
                quantity: true,
              },
              with: {
                store: {
                  columns: {
                    email: true,
                    name: true,
                  },
                },
                product: {
                  columns: { name: true },
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
          item.orderItem.availableItem.currentPrice * item.orderItem.quantity,
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
            item.orderItem.availableItem.currentPrice * item.orderItem.quantity,
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
          email: item.orderItem.store.email || "",
          storeName: item.orderItem.store.name || "",
          orderId,
          orderDate: `${format(order.createdAt, "MMMM do, yyyy")}`,
          item: `${item.orderItem.product.name} (Qty: ${
            item.orderItem.quantity
          }), price: ${formatPrice(item.orderItem.availableItem.currentPrice, {
            currency: "GBP",
          })}`,
          reason: returnRequest.reason,
        });
      })
    );

    //Update Order status.
    await db
      .update(OrderTable)
      .set({
        status: orderStatuses[11],
      })
      .where(eq(OrderTable.id, order.id));

    //Update number of product in stocks for each order item.
    const orderItems = returnRequest.returnItems.map((item) => item.orderItem);

    await Promise.all(
      orderItems.map(async (orderItem) => {
        await db
          .update(AvailableItemTable)
          .set({
            numInStocks: orderItem.quantity + 1,
          })
          .where(eq(OrderItemTable.id, orderItem.availableItem.id));
      })
    );

    return new Response(
      JSON.stringify({
        message: "Your return request has been accepted!",
      })
    );
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
