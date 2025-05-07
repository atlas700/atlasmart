import { sendOrderStatusUpdateEmail } from "@/lib/mail";
import { format } from "date-fns";
import {
  SHIPPING_FEE,
  TRANSACTION_FEE,
  formatPrice,
  getOrderStatusText,
} from "@/lib/utils";
import { getCurrentUser } from "@/services/clerk";
import {
  AvailableItemTable,
  OrderItemTable,
  orderStatuses,
  OrderTable,
  StoreTable,
  userRoles,
  UserTable,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string; orderItemId: string }> }
) {
  try {
    const { storeId, orderItemId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!orderItemId) {
      return new Response("Order item Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, you need to be logged in.", {
        status: 401,
      });
    }

    //Check if user is a seller
    if (user.role !== userRoles[2]) {
      return new Response("Unauthorized, you need be a seller.", {
        status: 401,
      });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    //Check if order item exists
    const orderItem = await db.query.OrderItemTable.findFirst({
      where: and(
        eq(OrderItemTable.id, orderItemId),
        eq(OrderItemTable.storeId, storeId)
      ),
    });

    if (!orderItem) {
      return new Response("Order item not found!", { status: 404 });
    }

    //Check if order status is confirmed
    const order = await db.query.OrderTable.findFirst({
      where: eq(OrderTable.id, orderItem.orderId),
      columns: {
        status: true,
      },
      with: {
        orderItems: {
          columns: {
            readyToBeShipped: true,
          },
        },
      },
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    if (order?.status !== orderStatuses[1]) {
      return new Response(
        "Order not yet confirmed, it needs to be confirmed for shipping",
        { status: 401 }
      );
    }

    const [updatedOrderItem] = await db
      .update(OrderItemTable)
      .set({ readyToBeShipped: true })
      .where(
        and(
          eq(OrderItemTable.id, orderItem.id),
          eq(OrderItemTable.storeId, storeId)
        )
      )
      .returning();

    const updatedOrder = await db.query.OrderTable.findFirst({
      where: eq(OrderTable.id, updatedOrderItem!.orderId),
      columns: {
        id: true,
      },
      with: {
        orderItems: {
          columns: {
            readyToBeShipped: true,
          },
        },
      },
    });

    if (
      updatedOrder?.orderItems.every((item) => item.readyToBeShipped === true)
    ) {
      // Update the order status
      await db
        .update(OrderTable)
        .set({ status: orderStatuses[3] })
        .where(eq(OrderTable.id, updatedOrderItem!.orderId));

      // Get the updated order with relations
      const newOrder = await db.query.OrderTable.findFirst({
        where: eq(OrderTable.id, updatedOrderItem!.orderId),
        with: {
          user: {
            columns: { name: true, email: true },
          },
          orderItems: {
            columns: { quantity: true, readyToBeShipped: true },
            with: {
              availableItem: {
                columns: { currentPrice: true },
              },
            },
          },
        },
      });

      //Send confirmation to user
      const totalAmount =
        newOrder?.orderItems?.reduce(
          (total, item) =>
            total + item.availableItem?.currentPrice * item?.quantity,
          0
        ) || 0 + TRANSACTION_FEE + SHIPPING_FEE;

      await sendOrderStatusUpdateEmail({
        email: newOrder!.user.email || "",
        username: newOrder!.user.name || "",
        orderId: newOrder?.id || "",
        orderDate: `${format(newOrder?.createdAt || "", "MMMM do, yyyy")}`,
        orderStatus: getOrderStatusText(newOrder?.status as any) || "",
        address: newOrder?.address || "",
        totalAmount: `${formatPrice(totalAmount, { currency: "USD" })}`,
      });
    }

    return new Response(
      JSON.stringify({ message: "Item is now ready to be shipped!" })
    );
  } catch (err) {
    console.log("[ORDER_ITEM_UPDATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
