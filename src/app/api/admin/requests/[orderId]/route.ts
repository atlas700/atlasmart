import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function GET(
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
        "Unauthorized, Only admin can get refund request",
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

    const returnRequest = await prismadb.returnRequest.findUnique({
      where: {
        orderId: order.id,
      },
      include: {
        returnItems: {
          include: {
            orderitem: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                productItem: {
                  select: {
                    images: true,
                  },
                },
                availableItem: {
                  select: {
                    currentPrice: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(returnRequest);
  } catch (err) {
    console.log("[RETURN_REQUEST_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
