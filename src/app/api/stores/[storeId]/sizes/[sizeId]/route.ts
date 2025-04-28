import { db } from "@/drizzle/db";
import { SizeTable, StoreTable, userRoles } from "@/drizzle/schema";
import { SizeSchema } from "@/lib/validators/size";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, ilike, ne } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { storeId, sizeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!sizeId) {
      return new Response("Size Id is required", { status: 400 });
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
      validatedBody = SizeSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { name, value } = validatedBody;

    //Check if category name exists
    const size = await db.query.SizeTable.findFirst({
      where: and(
        ne(SizeTable.id, sizeId),
        eq(StoreTable.id, storeId),
        ilike(SizeTable.name, name)
      ),
    });

    if (size) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db
      .update(SizeTable)
      .set({
        name,
        value,
      })
      .where(and(eq(SizeTable.id, sizeId), eq(SizeTable.storeId, storeId)));

    return new Response(JSON.stringify({ messsage: "Size Updated!" }));
  } catch (err) {
    console.log("[SIZE_UPDATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { storeId, sizeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!sizeId) {
      return new Response("Size Id is required", { status: 400 });
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
      .delete(SizeTable)
      .where(and(eq(SizeTable.id, sizeId), eq(SizeTable.storeId, storeId)));

    return new Response(JSON.stringify({ message: "Size Deleted!" }));
  } catch (err) {
    console.log("[SIZE_DELETE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
