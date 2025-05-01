import { db } from "@/drizzle/db";
import { ColorTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user is an admin
    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized, You need to be an admin.", {
        status: 401,
      });
    }

    const body = await request.json();

    const { colorIds } = body;

    const colors = await Promise.all(
      colorIds.map(async (id: string) => {
        const color = await db.query.ColorTable.findFirst({
          where: eq(ColorTable.id, id),
        });

        return color;
      })
    );

    return new Response(JSON.stringify(colors));
  } catch (err) {
    console.log("[ADMIN_COLOR_GET_SOME]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
