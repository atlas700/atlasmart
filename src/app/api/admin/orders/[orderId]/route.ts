import { format } from "date-fns";
import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/mail";
import { OrderStatusSchema } from "@/lib/validators/order-status";
import {
  SHIPPING_FEE,
  TRANSACTION_FEE,
  formatPrice,
  getOrderStatusText,
} from "@/lib/utils";

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
    if (user.role !== UserRole.ADMIN) {
      return new NextResponse(
        "Unauthorized, Only admin can change order status",
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
    });

    if (!order) {
      return new NextResponse("Order not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = OrderStatusSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { status } = validatedBody;

    //Update order status
    const updatedOrder = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            availableItem: {
              select: {
                currentPrice: true,
              },
            },
          },
        },
        status: true,
        address: true,
        createdAt: true,
      },
    });

    //Send confirmation to user
    const totalAmount =
      updatedOrder?.orderItems?.reduce(
        (total, item) =>
          total + item.availableItem?.currentPrice * item?.quantity,
        0
      ) || 0 + TRANSACTION_FEE + SHIPPING_FEE;

    await sendOrderStatusUpdateEmail({
      email: updatedOrder.user.email || "",
      username: updatedOrder.user.name || "",
      orderId: updatedOrder?.id || "",
      orderDate: `${format(updatedOrder?.createdAt || "", "MMMM do, yyyy")}`,
      orderStatus: getOrderStatusText(updatedOrder?.status as any) || "",
      address: updatedOrder?.address || "",
      totalAmount: `${formatPrice(totalAmount, { currency: "GBP" })}`,
    });

    return NextResponse.json({ message: "Order status has been updated!" });
  } catch (err) {
    console.log("[CHANGE_ORDER_STATUS]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
