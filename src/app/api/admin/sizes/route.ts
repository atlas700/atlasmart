import { db } from "@/drizzle/db";
import { SizeTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if user is a seller

    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const { sizeIds } = body;

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await db.query.SizeTable.findFirst({
          where: eq(SizeTable.id, id),
        });

        return size;
      })
    );

    return new Response(JSON.stringify(sizes));
  } catch (err) {
    console.log("[SIZE_ADMIN_GET]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
