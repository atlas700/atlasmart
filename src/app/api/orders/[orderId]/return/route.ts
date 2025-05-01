import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { sendReturnRequestEmail } from "@/lib/mail";
import { ReturnSchema } from "@/lib/validators/return";
import { getCurrentUser } from "@/services/clerk";
import { userRoles } from "@/drizzle/schema/twoFactorToken";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import {
  orderStatuses,
  OrderTable,
  ReturnItemTable,
  ReturnRequestTable,
} from "@/drizzle/schema";

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
      columns: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    //Check if order status is Delivered
    if (order.status !== orderStatuses[6]) {
      return new Response("You can request a return at this time", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ReturnSchema.parse(body);
    } catch (err) {
      return Response.json("Invalid Credentials", { status: 400 });
    }

    const { orderItemIds, reason } = validatedBody;

    //Create a return request
    const [returnRequest] = await db
      .insert(ReturnRequestTable)
      .values({
        orderId: order.id,
        reason,
      })
      .returning({
        id: ReturnRequestTable.id,
      });

    //Create request Items
    await Promise.all(
      orderItemIds.map(async (id) => {
        await db.insert(ReturnItemTable).values({
          orderItemId: id,
          returnRequestId: returnRequest.id,
        });
      })
    );

    //Update order status
    const [updatedOrder] = await db
      .update(OrderTable)
      .set({
        status: orderStatuses[8],
      })
      .where(and(eq(OrderTable.id, order.id), eq(OrderTable.userId, user.id)))
      .returning();

    const returnItems = await db.query.ReturnItemTable.findMany({
      where: eq(ReturnItemTable.returnRequestId, returnRequest.id),
      with: {
        orderItem: {
          columns: {
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
            availableItem: {
              columns: {
                currentPrice: true,
              },
            },
          },
        },
      },
    });

    const allItems = returnItems
      .map(
        (item) =>
          `${item.orderItem.product.name} (Qty: ${
            item.orderItem.quantity
          }) price: ${formatPrice(item.orderItem.availableItem.currentPrice, {
            currency: "USD",
          })}`
      )
      .join(", ");

    //Send confirmation to users
    await sendReturnRequestEmail({
      email: user.email || "",
      username: user.name || "",
      orderId: updatedOrder.id,
      orderDate: `${format(updatedOrder.createdAt, "MMMM do, yyyy")}`,
      items: allItems,
    });

    return Response.json({ message: "Refund request has been submitted!" });
  } catch (err) {
    console.log("[RETURN_REQUEST]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
