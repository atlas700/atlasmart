import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentRole, currentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string; reviewId: string } }
) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized, You need to be logged in", {
        status: 401,
      });
    }

    //Check if current role is USER
    const { role } = await currentRole();

    if (role !== UserRole.USER) {
      return new NextResponse("Unauthorized, Only users can mark as helpful", {
        status: 401,
      });
    }

    const { productId, reviewId } = params;

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!reviewId) {
      return new NextResponse("Review Id is required", { status: 400 });
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

    //Check if review exists
    const review = await prismadb.review.findUnique({
      where: {
        id: reviewId,
        productId,
      },
    });

    if (!review) {
      return new NextResponse("Review not found!", { status: 404 });
    }

    //Check if user created this review
    if (review.userId === user.id) {
      return new NextResponse("You cannot mark your review as helpful", {
        status: 400,
      });
    }

    //Check if user alredy marked review
    if (review.helpful.includes(user.id)) {
      return NextResponse.json({
        message: "User already marked review as helpful",
      });
    }

    //Update review
    await prismadb.review.update({
      where: {
        id: reviewId,
        productId,
      },
      data: {
        helpful: [user.id, ...review.helpful],
      },
    });

    return NextResponse.json({ message: "Review marked as helpful!" });
  } catch (err) {
    console.log("MARK_HELPFUL_REVIEW", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string; reviewId: string } }
) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized, You need to be logged in", {
        status: 401,
      });
    }

    //Check if current role is USER
    const { role } = await currentRole();

    if (role !== UserRole.USER) {
      return new NextResponse("Unauthorized, Only users can delete review", {
        status: 401,
      });
    }

    const { productId, reviewId } = params;

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!reviewId) {
      return new NextResponse("Review Id is required", { status: 400 });
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

    //Check if review exists
    const review = await prismadb.review.findUnique({
      where: {
        id: reviewId,
        productId,
      },
    });

    if (!review) {
      return new NextResponse("Review not found!", { status: 404 });
    }

    //Delete review
    await prismadb.review.delete({
      where: {
        id: reviewId,
        productId,
      },
    });

    return NextResponse.json({ message: "Review has been deleted!" });
  } catch (err) {
    console.log("REVIEW_DELETE", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
