"use client";

import React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ReviewType } from "@/types";
import { UserRole } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { FaStar, FaRegStar } from "react-icons/fa6";
import useCurrentUser from "@/hooks/use-current-user";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  review: ReviewType;
  productId: string;
  disabled: boolean;
};

const ReviewItem = ({ review, productId, disabled }: Props) => {
  const { user } = useCurrentUser();

  const queryClient = useQueryClient();

  const { mutate: markAshelpful, isPending } = useMutation({
    mutationKey: ["mark-as-helpful", review.id],
    mutationFn: async () => {
      await axios.patch(`/api/products/${productId}/reviews/${review.id}`);
    },
    onSuccess: (data) => {
      toast.success("Marked as helpful");

      queryClient.invalidateQueries({
        queryKey: ["get-limited-reviews", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-reviews-details", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-initial-reviews", productId],
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
      console.log(err);
    },
  });

  const { mutate: deleteReview, isPending: deleting } = useMutation({
    mutationKey: ["delete-review"],
    mutationFn: async () => {
      await axios.delete(`/api/products/${productId}/reviews/${review.id}`);
    },
    onSuccess: () => {
      toast.success("Review Deleted!");

      queryClient.invalidateQueries({
        queryKey: ["get-reviews-details", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-limited-reviews", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-initial-reviews", productId],
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={review?.user?.image || "/no-profile.jpeg"} />
        </Avatar>

        <p className="font-medium">{review?.user?.name}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {new Array(5).fill("").map((_, index) => (
              <span key={index}>
                {review?.value >= index + 1 ? (
                  <FaStar className="w-4 h-4 text-yellow-500" />
                ) : (
                  <FaRegStar className="w-4 h-4 text-yellow-500" />
                )}
              </span>
            ))}
          </div>

          <p className="font-bold">{review?.reason}</p>
        </div>

        <p className="text-gray-500">
          Reviewed on {format(review?.createdAt, "d MMMM yyyy")}
        </p>
      </div>

      <p>{review?.comment}</p>

      {review?.helpful?.length > 0 && (
        <p>
          {review?.helpful?.length}{" "}
          {review?.helpful?.length > 1 ? "people" : "person"} found this helpful
        </p>
      )}

      {user?.id && review?.userId === user?.id && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => deleteReview()}
          disabled={disabled || deleting || isPending}
        >
          Delete
        </Button>
      )}

      {user?.id &&
        user?.role === UserRole.USER &&
        review?.userId !== user?.id &&
        !review?.helpful?.includes(user?.id) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => markAshelpful()}
            disabled={disabled || deleting || isPending}
          >
            Helpful
          </Button>
        )}
    </div>
  );
};

export default ReviewItem;
