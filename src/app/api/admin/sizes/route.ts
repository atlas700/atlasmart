import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller

    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const { sizeIds } = body;

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await prismadb.size.findUnique({ where: { id } });

        return size;
      })
    );

    return NextResponse.json(sizes);
  } catch (err) {
    console.log("[SIZE_ADMIN_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
