import { z } from "zod";
import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { ReviewSchema } from "@/lib/validators/review";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const url = new URL(request.url);

    const { limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

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

    const reviews = await prismadb.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.log("GET_REVIEWS", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
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
      return new NextResponse(
        "Unauthorized, You need to be logged in to add a review",
        { status: 401 }
      );
    }

    //Check if user role is USER
    if (user.role !== UserRole.USER) {
      return new NextResponse("Unauthorized, Only users can add review", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ReviewSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { value, reason, comment } = validatedBody;

    //check if product exists
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found!", { status: 404 });
    }

    await prismadb.review.create({
      data: {
        userId: user.id,
        productId,
        storeId: product.storeId,
        value,
        comment,
        reason,
      },
    });

    return NextResponse.json({ maeesge: "Review Created!" });
  } catch (err) {
    console.log("CREATE_REVIEW", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
