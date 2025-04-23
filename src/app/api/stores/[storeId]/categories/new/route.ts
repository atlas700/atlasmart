import { db } from "@/drizzle/db";
import { CategoryTable, StoreTable, userRoles } from "@/drizzle/schema";
import { CategorySchema } from "@/lib/validators/category";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

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

    console.log(body);

    let validatedBody;

    try {
      validatedBody = CategorySchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name } = validatedBody;

    //Check if category name exists
    const category = await db.query.CategoryTable.findFirst({
      where: and(
        eq(CategoryTable.storeId, storeId),
        eq(CategoryTable.name, name)
      ),
    });

    if (category) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db.insert(CategoryTable).values({
      name,
      storeId,
    });

    return new Response(JSON.stringify({ message: "Category Created!" }));
  } catch (err) {
    console.log("[CATEGORY_CREATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
