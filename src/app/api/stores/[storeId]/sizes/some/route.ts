import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

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
    if (user.role !== "SELLER") {
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

    const { sizeIds } = body;

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await prismadb.size.findUnique({ where: { id, storeId } });

        return size;
      })
    );

    return NextResponse.json(sizes);
  } catch (err) {
    console.log("[SIZE_GET_SOME]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
