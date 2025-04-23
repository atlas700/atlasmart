import { db } from "@/drizzle/db";
import { SizeTable, StoreTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== userRoles[2]) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    const sizes = await db.query.SizeTable.findMany({
      where: eq(StoreTable.id, storeId),
    });

    return new Response(JSON.stringify(sizes));
  } catch (err) {
    console.log("[SIZE_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
