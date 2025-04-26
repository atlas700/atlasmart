"use client";

import React from "react";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import { UserRole } from "@prisma/client";
import Spinner from "@/components/Spinner";
import Container from "@/components/Container";
import useCurrentUser from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import {
  checkIfReviewed,
  getReviewCount,
  getReviewsForProduct,
} from "@/data/review";

type Props = {
  productId: string;
};

const Reviews = ({ productId }: Props) => {
  const { user } = useCurrentUser();

  const { data } = useQuery({
    queryKey: ["get-reviews-details", productId],
    queryFn: async () => {
      const reviewCount = await getReviewCount(productId);

      const hasReviewed = await checkIfReviewed({
        userId: user?.id || "",
        productId,
      });

      return { reviewCount, hasReviewed };
    },
    staleTime: 1000 * 60 * 5,
  });

  const showForm =
    user && user.role === UserRole.USER && (!data?.hasReviewed || false);

  const {
    data: initialReviews,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-initial-reviews", productId],
    queryFn: async () => {
      const reviews = await getReviewsForProduct(productId);

      return reviews;
    },
  });

  return (
    <div className="w-full bg-white py-14">
      <Container>
        <div className="space-y-5">
          <h1 className="text-2xl md:text-3xl font-bold">
            Reviews ({data?.reviewCount || 0})
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <ReviewForm showForm={showForm || false} productId={productId} />

            {isLoading && (
              <div className="w-full p-5 flex items-center justify-center">
                <Spinner />
              </div>
            )}

            {!isLoading &&
              !isError &&
              Array.isArray(initialReviews) &&
              initialReviews.length > 0 && (
                <ReviewList
                  productId={productId}
                  initialData={initialReviews}
                  reviewCount={data?.reviewCount || 0}
                />
              )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Reviews;
