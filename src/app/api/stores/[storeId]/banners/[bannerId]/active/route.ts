import { db } from "@/drizzle/db";
import { BannerTable, StoreTable, userRoles } from "@/drizzle/schema";
import { apiRatelimit } from "@/lib/redis";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, ne } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string; bannerId: string }> }
) {
  try {
    const { storeId, bannerId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!bannerId) {
      return new Response("Banner Id is required", { status: 400 });
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

    const { success } = await apiRatelimit.limit(user.id);

    if (!success && process.env.VERCEL_ENV === "production") {
      return new Response(
        JSON.stringify("Too Many Requests! try again in 1 min"),
        {
          status: 429,
        }
      );
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    //Check if banner exists
    const banner = await db.query.BannerTable.findFirst({
      where: and(
        eq(BannerTable.id, bannerId),
        eq(BannerTable.storeId, storeId)
      ),
    });

    if (!banner) {
      return new Response("Banner not found!", { status: 404 });
    }

    //Set current banner status to active
    await db
      .update(BannerTable)
      .set({
        active: true,
      })
      .where(eq(BannerTable.id, bannerId));

    //Set other banners status to not active
    await db
      .update(BannerTable)
      .set({
        active: false,
      })
      .where(
        and(eq(BannerTable.storeId, storeId), ne(BannerTable.id, bannerId))
      );

    return new Response(
      JSON.stringify({ message: "Banner has been set to active!" })
    );
  } catch (err) {
    console.log("[BANNER_UPDATE_ACTIVE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
