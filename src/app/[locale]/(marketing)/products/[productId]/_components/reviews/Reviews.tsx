"use client";

import Container from "@/components/Container";
import Spinner from "@/components/Spinner";
import {
  checkIfReviewed,
  getReviewCount,
  getReviewsForProduct,
} from "@/features/reviews/db/reviews";
import { UserRole, userRoles } from "@/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

type Props = {
  productId: string;
  currentUser?: {
    id: string | undefined;
    role: UserRole | undefined;
  };
};

const Reviews = ({ productId, currentUser }: Props) => {
  const user = currentUser;
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
    user && user.role === userRoles[0] && (!data?.hasReviewed || false);

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
                  currentUser={user}
                />
              )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Reviews;
