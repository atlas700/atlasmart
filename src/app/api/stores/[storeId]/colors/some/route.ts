import { db } from "@/drizzle/db";
import { ColorTable, StoreTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== userRoles[2]) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    const body = await request.json();

    const { colorIds } = body;

    const colors = await Promise.all(
      colorIds.map(async (id: string) => {
        const color = await db.query.ColorTable.findMany({
          where: and(eq(ColorTable.id, id), eq(ColorTable.storeId, storeId)),
        });

        return color;
      })
    );

    return Response.json(colors);
  } catch (err) {
    console.log("[COLOR_GET_SOME]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
