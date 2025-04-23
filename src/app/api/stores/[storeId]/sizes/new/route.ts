import { db } from "@/drizzle/db";
import { SizeTable, StoreTable, userRoles } from "@/drizzle/schema";
import { SizeSchema } from "@/lib/validators/size";
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
      validatedBody = SizeSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { name, value } = validatedBody;

    //Check if category name exists
    const size = await db.query.SizeTable.findFirst({
      where: and(eq(SizeTable.storeId, storeId), eq(SizeTable.name, name)),
    });

    if (size) {
      return new Response("Name already taken!", { status: 409 });
    }

    await db.insert(SizeTable).values({
      name,
      value,
      storeId,
    });

    return new Response(JSON.stringify({ message: "Size Created!" }));
  } catch (err) {
    console.log("[SIZE_CREATE]", err);

    return new Response(JSON.stringify("Internal Error"), { status: 500 });
  }
}
