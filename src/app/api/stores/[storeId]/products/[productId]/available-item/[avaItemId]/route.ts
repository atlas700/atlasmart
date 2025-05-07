import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  storeStatuses,
  StoreTable,
  userRoles,
} from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; productId: string; avaItemId: string }>;
  }
) {
  try {
    const { storeId, productId, avaItemId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    if (!avaItemId) {
      return new Response("Available Item Id is required", { status: 400 });
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

    //Check if store has been approved
    if (store.status !== storeStatuses[2]) {
      return new Response("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    //check if product item exists
    const itemExist = await db.query.AvailableItemTable.findFirst({
      where: and(
        eq(AvailableItemTable.id, avaItemId),
        eq(AvailableItemTable.productId, productId)
      ),
    });

    if (!itemExist) {
      return new Response("Item not found!", {
        status: 404,
      });
    }

    //Delete Product Item
    await db
      .delete(AvailableItemTable)
      .where(
        and(
          eq(AvailableItemTable.id, avaItemId),
          eq(AvailableItemTable.productId, productId)
        )
      );

    return new Response(JSON.stringify({ message: "Item Deleted!" }));
  } catch (err) {
    console.log("[AVAILABLE_ITEM_DELETE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
