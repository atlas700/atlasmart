"use client";

import React from "react";
import { ReviewType } from "../../../../../../../../types";
import ReviewItem from "./ReviewItem";
import Spinner from "@/components/Spinner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
  productId: string;
  reviews: ReviewType[];
  error: Error | null;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  disabled: boolean;
};

const ReviewsSheet = ({
  children,
  productId,
  reviews,
  error,
  disabled,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: Props) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent>
        <div className="h-full overflow-y-scroll scrollbar-hide">
          <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-6">
              {!error &&
                reviews?.map((review) => (
                  <ReviewItem
                    key={review?.id}
                    review={review}
                    productId={productId}
                    disabled={disabled}
                  />
                ))}
            </div>

            {hasNextPage && (
              <button
                className="text-sm text-left hover:underline transition"
                disabled={disabled}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? <Spinner /> : "Load more"}
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReviewsSheet;
