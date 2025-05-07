import { db } from "@/drizzle/db";
import { SizeTable, StoreTable } from "@/drizzle/schema";
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
    if (user.role !== "SELLER") {
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

    const { sizeIds } = body;

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await db.query.SizeTable.findFirst({
          where: and(eq(SizeTable.id, id), eq(SizeTable.storeId, storeId)),
        });

        return size;
      })
    );

    return new Response(JSON.stringify(sizes));
  } catch (err) {
    console.log("[SIZE_GET_SOME]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
