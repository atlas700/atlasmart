import { apiRatelimit } from "@/lib/redis";
import { BannerSchema } from "@/lib/validators/banner";
import { getCurrentUser } from "@/services/clerk";
import { BannerTable, StoreTable, userRoles } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { and, eq, ilike } from "drizzle-orm";

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

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = BannerSchema.parse(body);
    } catch (err) {
      return Response.json("Invalid Credentials", { status: 400 });
    }

    const { name, image } = validatedBody;

    //Check if banner name exists
    const banner = await db.query.BannerTable.findFirst({
      where: and(
        eq(BannerTable.storeId, storeId),
        ilike(BannerTable.name, name)
      ),
    });

    if (banner) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db.insert(BannerTable).values({
      name,
      image,
      storeId,
    });

    return new Response(JSON.stringify({ message: "Banner Created!" }));
  } catch (err) {
    console.log("[BANNER_CREATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
