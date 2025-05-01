import { db } from "@/drizzle/db";
import { StoreTable, userRoles } from "@/drizzle/schema";
import { StatusSchema } from "@/lib/validators/status";
import { getCurrentUser } from "@/services/clerk";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized", { status: 401 });
    }

    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.id, storeId),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = StatusSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { status, statusFeedback } = validatedBody;

    if (!status || !statusFeedback) {
      return new Response("Status and feedback required!", { status: 400 });
    }

    await db
      .update(StoreTable)
      .set({
        status,
        statusFeedback,
      })
      .where(eq(StoreTable.id, storeId));

    return new Response(JSON.stringify({ message: "Status updated!" }));
  } catch (err) {
    console.log("[STORE_STATUS_PATCH]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
