import { db } from "@/drizzle/db";
import {
  BannerTable,
  CategoryTable,
  StoreTable,
  userRoles,
} from "@/drizzle/schema";
import { apiRatelimit } from "@/lib/redis";
import { BannerSchema } from "@/lib/validators/banner";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, ilike, ne, not } from "drizzle-orm";

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
      return Response.json("Too Many Requests! try again in 1 min", {
        status: 429,
      });
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
      validatedBody = BannerSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { name, image } = validatedBody;

    //Check if banner name exists
    const banner = await db.query.CategoryTable.findFirst({
      where: and(
        ne(CategoryTable.id, bannerId),
        eq(CategoryTable.storeId, storeId),
        ilike(CategoryTable.name, name)
      ),
    });

    if (banner) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db
      .update(BannerTable)
      .set({ name, image })
      .where(eq(BannerTable.id, bannerId));

    return new Response(JSON.stringify({ message: "Banner Updated!" }));
  } catch (err) {
    console.log("[BANNER_UPDATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
    await db.delete(BannerTable).where(eq(BannerTable.id, bannerId));

    return new Response(JSON.stringify({ message: "Banner Deleted!" }));
  } catch (err) {
    console.log("[BANNER_DELETE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
