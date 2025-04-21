import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    //check if product exists
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found!", { status: 404 });
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
    console.log("GET_COLORS_SOME_PRODUCT", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
