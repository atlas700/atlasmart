"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { INFINITE_SCROLL_REVIEWS_RESULT } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { ReviewType } from "../../../../../../../../types";
import ReviewItem from "./ReviewItem";
import ReviewsSheet from "./ReviewsSheet";

type Props = {
  productId: string;
  initialData: ReviewType[];
  reviewCount: number;
  currentUser?: {
    id: string | undefined;
    role: string | undefined;
  };
};

const ReviewList = ({ productId, initialData, reviewCount }: Props) => {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["get-limited-reviews", productId],
      queryFn: async ({ pageParam = 1 }) => {
        const { data } = await axios.get(
          `/api/products/${productId}/reviews?limit=${INFINITE_SCROLL_REVIEWS_RESULT}&page=${pageParam}`
        );

        return data;
      },
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialData], pageParams: [1] },
    });

  //@ts-ignore
  const reviews: ReviewType[] =
    data?.pages?.flatMap((page) => page) ?? initialData;

  return (
    <div className="w-full space-y-4">
      <ScrollArea>
        <div className="flex flex-col gap-6">
          {initialData?.map((review) => (
            <ReviewItem
              key={review?.id}
              review={review}
              productId={productId}
              disabled={!hasNextPage || isFetchingNextPage}
            />
          ))}
        </div>
      </ScrollArea>

      {reviewCount > initialData.length && (
        <ReviewsSheet
          productId={productId}
          reviews={reviews}
          error={error}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          <button
            type="button"
            className="w-20 text-sm text-left hover:underline transition"
          >
            Load More
          </button>
        </ReviewsSheet>
      )}
    </div>
  );
};

export default ReviewList;
