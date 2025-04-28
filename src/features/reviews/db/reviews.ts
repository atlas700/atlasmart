"use server";

import { db } from "@/drizzle/db";
import { ReviewTable } from "@/drizzle/schema";
import { INFINITE_SCROLL_REVIEWS_RESULT } from "@/lib/utils";
import { and, count, desc, eq } from "drizzle-orm";

export const getReviewsForProduct = async (productId: string) => {
  if (!productId) return [];

  try {
    const reviews = await db.query.ReviewTable.findMany({
      where: eq(ReviewTable.productId, productId),
      with: {
        user: {
          columns: {
            name: true,
            imageUrl: true,
          },
        },
      },
      limit: INFINITE_SCROLL_REVIEWS_RESULT,
      orderBy: desc(ReviewTable.createdAt),
    });

    return reviews;
  } catch (err) {
    return [];
  }
};

export const getReviewCount = async (productId: string) => {
  if (!productId) return 0;

  try {
    const reviewCount = await db
      .select({ count: count(ReviewTable.id) })
      .from(ReviewTable)
      .where(eq(ReviewTable.productId, productId))
      .then((rows) => rows[0]?.count ?? 0);

    return reviewCount;
  } catch (err) {
    return 0;
  }
};

export const checkIfReviewed = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  if (!userId || !productId) return false;

  try {
    const review = await db
      .select({ count: count(ReviewTable.id) })
      .from(ReviewTable)
      .where(
        and(
          eq(ReviewTable.productId, productId),
          eq(ReviewTable.userId, userId)
        )
      )
      .then((rows) => rows[0]?.count ?? 0);

    const hasReviewed = review > 0;

    return hasReviewed;
  } catch (err) {
    return false;
  }
};
