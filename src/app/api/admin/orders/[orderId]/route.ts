import { format } from "date-fns";
import { sendOrderStatusUpdateEmail } from "@/lib/mail";
import { OrderStatusSchema } from "@/lib/validators/order-status";
import {
  SHIPPING_FEE,
  TRANSACTION_FEE,
  formatPrice,
  getOrderStatusText,
} from "@/lib/utils";
import { getCurrentUser } from "@/services/clerk";
import { OrderTable, userRoles, UserTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

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
    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized, Only admin can change order status", {
        status: 401,
      });
    }

    //check if order exists
    const order = await db.query.OrderTable.findFirst({
      where: eq(OrderTable.id, orderId),
    });

    if (!order) {
      return new Response("Order not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = OrderStatusSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { status } = validatedBody;

    //Update order status
    const updatedOrder = await updateOrderStatus(orderId, status);

    //Send confirmation to user
    const totalAmount =
      updatedOrder?.orderItems?.reduce(
        (total, item) =>
          total + item.availableItem?.currentPrice * item?.quantity,
        0
      ) || 0 + TRANSACTION_FEE + SHIPPING_FEE;

    await sendOrderStatusUpdateEmail({
      email: updatedOrder?.user.email || "",
      username: updatedOrder?.user.name || "",
      orderId: updatedOrder?.id || "",
      orderDate: `${format(updatedOrder?.createdAt || "", "MMMM do, yyyy")}`,
      orderStatus: getOrderStatusText(updatedOrder?.status as any) || "",
      address: updatedOrder?.address || "",
      totalAmount: `${formatPrice(totalAmount, { currency: "GBP" })}`,
    });

    return new Response(
      JSON.stringify({ message: "Order status has been updated!" })
    );
  } catch (err) {
    console.log("[CHANGE_ORDER_STATUS]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

async function updateOrderStatus(
  orderId: string,
  status: "READYFORSHIPPING" | "SHIPPED" | "OUTFORDELIVERY" | "DELIVERED"
) {
  return await db.transaction(async (tx) => {
    // 1) update the status column
    await tx
      .update(OrderTable) // 3️⃣ :contentReference[oaicite:2]{index=2}
      .set({ status }) // 4️⃣ :contentReference[oaicite:3]{index=3}
      .where(eq(OrderTable.id, orderId)); // 5️⃣ :contentReference[oaicite:4]{index=4}

    // 2) fetch the updated row with nested relations
    const updated = await tx.query.OrderTable.findFirst({
      where: eq(OrderTable.id, orderId), // 6️⃣ :contentReference[oaicite:5]{index=5}
      with: {
        user: {
          columns: { email: true, name: true },
        },
        orderItems: {
          columns: { quantity: true },
          with: {
            availableItem: { columns: { currentPrice: true } },
          },
        },
      },
      columns: {
        id: true,
        status: true,
        address: true,
        createdAt: true,
      },
    }); // 7️⃣ :contentReference[oaicite:6]{index=6}

    return updated;
  });
}
