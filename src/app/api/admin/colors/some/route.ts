import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized, You need to be logged in.", {
        status: 401,
      });
    }

    //Check if user is an admin
    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized, You need to be an admin.", {
        status: 401,
      });
    }

    const body = await request.json();

    const { colorIds } = body;

    const colors = await Promise.all(
      colorIds.map(async (id: string) => {
        const color = await prismadb.color.findUnique({
          where: { id },
        });

        return color;
      })
    );

    return NextResponse.json(colors);
  } catch (err) {
    console.log("[ADMIN_COLOR_GET_SOME]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
