"use client";

import React from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewValidator, ReviewSchema } from "@/lib/validators/review";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  showForm: boolean;
  productId: string;
};

const ReviewForm = ({ showForm, productId }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<ReviewValidator>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      value: 0,
      reason: "",
      comment: "",
    },
  });

  const { mutate: addReview, isPending } = useMutation({
    mutationKey: ["add-review", productId],
    mutationFn: async (values: ReviewValidator) => {
      await axios.post(`/api/products/${productId}/reviews`, values);
    },
    onSuccess: () => {
      toast.success("Review Added!");

      form.reset();

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

  const onSubmit = (values: ReviewValidator) => {
    addReview(values);
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="w-full space-y-4" data-cy={`review-form-${productId}`}>
      <div className="space-y-0.5">
        <h2 className="font-semibold">Write a Review</h2>

        <p className="text-sm text-gray-500">
          Share your thoughts about the product.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>

                  <FormControl>
                    <div className="flex items-center gap-1">
                      {new Array(5).fill("").map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          disabled={isPending}
                          onClick={() => field.onChange(index + 1)}
                          onMouseEnter={() => field.onChange(index + 1)}
                        >
                          {field.value >= index + 1 ? (
                            <FaStar className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <FaRegStar className="w-5 h-5 text-yellow-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </FormControl>

                  <FormMessage data-cy={`star-err-${productId}`} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Reason for rating..."
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage data-cy={`reason-err-${productId}`} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Tell us your experience..."
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage data-cy={`comment-err-${productId}`} />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            data-cy={`submit-review-${productId}`}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;
