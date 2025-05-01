import { db } from "@/drizzle/db";
import { OrderTable, ReturnRequestTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { desc, eq } from "drizzle-orm";

export async function GET(
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
      return new Response("Unauthorized, Only admin can get refund request", {
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

    const returnRequest = await db.query.ReturnRequestTable.findFirst({
      where: eq(ReturnRequestTable.orderId, order.id),
      with: {
        returnItems: {
          with: {
            orderItem: {
              columns: {
                quantity: true,
              },
              with: {
                product: {
                  with: {
                    category: {
                      columns: {
                        name: true,
                      },
                    },
                  },
                  columns: {
                    name: true,
                  },
                },
                productItem: {
                  columns: {
                    images: true,
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
        },
      },
      orderBy: desc(ReturnRequestTable.createdAt),
    });

    return new Response(JSON.stringify(returnRequest));
  } catch (err) {
    console.log("[RETURN_REQUEST_GET]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
