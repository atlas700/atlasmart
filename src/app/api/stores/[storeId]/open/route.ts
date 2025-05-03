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

    //Check if store has been closed
    if (store.status !== storeStatuses[4]) {
      return new Response("Unauthorized, store is not closed!", {
        status: 404,
      });
    }

    //UnArchived all products that belongs to that store.
    await db
      .update(ProductTable)
      .set({
        status: "APPROVED",
        statusFeedback:
          "Welcome back, Your product has been approved. It will be shown to potential customers.",
      })
      .where(
        and(eq(ProductTable.storeId, storeId), eq(ProductTable.userId, user.id))
      );

    await db
      .update(StoreTable)
      .set({
        status: "APPROVED",
        statusFeedback: "Welcome back, Your store has been approved.",
      })
      .where(and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)));

    return new Response(JSON.stringify({ message: "Store Opened!" }));
  } catch (err) {
    console.log("[STORE_OPENED]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
