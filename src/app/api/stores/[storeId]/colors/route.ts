import { db } from "@/drizzle/db";
import { ColorTable, StoreTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";
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

    const colors = await db.query.ColorTable.findMany({
      where: eq(ColorTable.storeId, storeId),
    });

    return new Response(JSON.stringify(colors));
  } catch (err) {
    console.log("[COLOR_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
