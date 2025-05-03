import { db } from "@/drizzle/db";
import {
  ProductTable,
  storeStatuses,
  StoreTable,
  userRoles,
} from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

export async function PATCH(
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

    //Check if store has been approved
    if (store.status !== storeStatuses[2]) {
      return new Response(
        "Unauthorized, store needs to be approved before you can close it!",
        { status: 404 }
      );
    }

    //Archived all products that belongs to that store.
    await db
      .update(ProductTable)
      .set({
        status: "ARCHIVED",
        statusFeedback:
          "Your product has been archived. It will not longer be visible to the customers. To change this open your store from your settings",
      })
      .where(
        and(eq(ProductTable.storeId, storeId), eq(StoreTable.userId, user.id))
      );

    await db
      .update(StoreTable)
      .set({
        status: "CLOSED",
        statusFeedback:
          "Your store has been closed and products belonging to this store is now invisible to customers. If you change your mind, you can reopen your store at any time from your settings.",
      })
      .where(and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)));

    return new Response(JSON.stringify({ message: "Store Closed!" }));
  } catch (err) {
    console.log("[STORE_CLOSED]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
