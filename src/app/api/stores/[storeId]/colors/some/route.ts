import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== UserRole.SELLER) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    const body = await request.json();

    const { colorIds } = body;

    const colors = await Promise.all(
      colorIds.map(async (id: string) => {
        const color = await prismadb.color.findUnique({
          where: { id, storeId },
        });

        return color;
      })
    );

    return NextResponse.json(colors);
  } catch (err) {
    console.log("[COLOR_GET_SOME]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
