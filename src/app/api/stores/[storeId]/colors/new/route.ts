import { db } from "@/drizzle/db";
import { ColorTable, StoreTable, userRoles } from "@/drizzle/schema";
import { ColorSchema } from "@/lib/validators/color";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

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

    let validatedBody;

    try {
      validatedBody = ColorSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { name, value } = validatedBody;

    //Check if category name exists
    const color = await db.query.ColorTable.findFirst({
      where: and(eq(ColorTable.storeId, storeId), eq(ColorTable.name, name)),
    });

    if (color) {
      return new Response(`${name} already taken!`, { status: 409 });
    }

    await db.insert(ColorTable).values({
      name,
      value,
      storeId,
    });

    return new Response(JSON.stringify({ message: "Color Created!" }));
  } catch (err) {
    console.log("[COLOR_CREATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
