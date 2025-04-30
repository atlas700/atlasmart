import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { ProductStatusSchema } from "@/lib/validators/product-status";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        productItems: {
          include: {
            availableItems: {
              include: {
                size: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.log("[PRODUCT_ADMIN_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ProductStatusSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { status, statusFeedback } = validatedBody;

    if (!status || !statusFeedback) {
      return new NextResponse("Status and feedback required!", { status: 400 });
    }

    await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        status,
        statusFeedback,
      },
    });

    return NextResponse.json({ message: "Status updated!" });
  } catch (err) {
    console.log("[PRODUCT_STATUS_PATCH]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
