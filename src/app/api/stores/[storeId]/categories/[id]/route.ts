import { db } from "@/drizzle/db";
import { CategoryTable, StoreTable, userRoles } from "@/drizzle/schema";
import { CategorySchema } from "@/lib/validators/category";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, ilike, ne } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string; id: string }> }
) {
  try {
    const { storeId, id } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!id) {
      return new Response("Category Id is required", { status: 400 });
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

    let validatedBody;

    try {
      validatedBody = CategorySchema.parse(body);
    } catch (err) {
      return Response.json("Invalid Credentials", { status: 400 });
    }

    const { name } = validatedBody;

    //Check if category name exists
    const category = await db.query.CategoryTable.findFirst({
      where: and(
        ne(CategoryTable.id, id),
        eq(CategoryTable.storeId, storeId),
        ilike(CategoryTable.name, name)
      ),
    });

    if (category) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db
      .update(CategoryTable)
      .set({
        name,
      })
      .where(and(eq(CategoryTable.id, id), eq(CategoryTable.storeId, storeId)));

    return new Response(JSON.stringify({ message: "Category Updated!" }));
  } catch (err) {
    console.log("[CATEGORY_UPDATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string; id: string }> }
) {
  try {
    const { storeId, id } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!id) {
      return new Response("Category Id is required", { status: 400 });
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

    await db
      .delete(CategoryTable)
      .where(and(eq(CategoryTable.id, id), eq(CategoryTable.storeId, storeId)));

    return new Response(JSON.stringify({ message: "Category Deleted!" }));
  } catch (err) {
    console.log("[CATEGORY_DELETE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
