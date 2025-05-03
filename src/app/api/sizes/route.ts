import { db } from "@/drizzle/db";
import { SizeTable, StoreTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { storeId, sizeIds } = body;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    //Check if the store exists
    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.id, storeId),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await db.query.SizeTable.findFirst({
          where: eq(SizeTable.storeId, storeId),
        });

        return size;
      })
    );

    return NextResponse.json(sizes);
  } catch (err) {
    console.log("[SIZE_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
