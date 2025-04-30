import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { storeId, sizeIds } = body;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //Check if the store exists
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    const sizes = await Promise.all(
      sizeIds.map(async (id: string) => {
        const size = await prismadb.size.findUnique({ where: { id, storeId } });

        return size;
      })
    );

    return NextResponse.json(sizes);
  } catch (err) {
    console.log("[SIZE_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
