import { db } from "@/drizzle/db";
import { ProductTable, ReviewTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string; reviewId: string }> }
) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, You need to be logged in", {
        status: 401,
      });
    }

    //Check if current role is USER
    const role = user.role;

    if (role !== userRoles[0]) {
      return new Response("Unauthorized, Only users can mark as helpful", {
        status: 401,
      });
    }

    const { productId, reviewId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    if (!reviewId) {
      return new Response("Review Id is required", { status: 400 });
    }

    //check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });

    if (!product) {
      return new Response("Product not found!", { status: 404 });
    }

    //Check if review exists
    const review = await db.query.ReviewTable.findFirst({
      where: and(
        eq(ReviewTable.id, reviewId),
        eq(ReviewTable.productId, productId)
      ),
    });

    if (!review) {
      return new Response("Review not found!", { status: 404 });
    }

    //Check if user created this review
    if (review.userId === user.id) {
      return new Response("You cannot mark your review as helpful", {
        status: 400,
      });
    }

    //Check if user alredy marked review
    if (review.helpful.includes(user.id)) {
      return new Response(
        JSON.stringify({
          message: "User already marked review as helpful",
        })
      );
    }

    //Update review
    await db
      .update(ReviewTable)
      .set({
        helpful: [...review.helpful, user.id],
      })
      .where(
        and(eq(ReviewTable.id, reviewId), eq(ReviewTable.productId, productId))
      );

    await db
      .update(ReviewTable)
      .set({
        helpful: [user.id, ...review.helpful],
      })
      .where(
        and(eq(ReviewTable.id, reviewId), eq(ReviewTable.productId, productId))
      );

    return new Response(
      JSON.stringify({ message: "Review marked as helpful!" })
    );
  } catch (err) {
    console.log("MARK_HELPFUL_REVIEW", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string; reviewId: string }> }
) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized, You need to be logged in", {
        status: 401,
      });
    }

    //Check if current role is USER
    const role = user.role;

    if (role !== userRoles[0]) {
      return new Response("Unauthorized, Only users can delete review", {
        status: 401,
      });
    }

    const { productId, reviewId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    if (!reviewId) {
      return new Response("Review Id is required", { status: 400 });
    }

    //check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });

    if (!product) {
      return new Response("Product not found!", { status: 404 });
    }

    //Check if review exists
    const review = await db.query.ReviewTable.findFirst({
      where: and(
        eq(ReviewTable.id, reviewId),
        eq(ReviewTable.productId, productId)
      ),
    });

    if (!review) {
      return new Response("Review not found!", { status: 404 });
    }

    //Delete review
    await db
      .delete(ReviewTable)
      .where(
        and(eq(ReviewTable.id, reviewId), eq(ReviewTable.productId, productId))
      );

    return new Response(
      JSON.stringify({ message: "Review has been deleted!" })
    );
  } catch (err) {
    console.log("REVIEW_DELETE", err);

    return new Response("Internal Error", { status: 500 });
  }
}
