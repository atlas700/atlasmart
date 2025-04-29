"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { OrderCol } from "@/types";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice, reasonsForReturn } from "@/lib/utils";
import { ReturnValidator, ReturnSchema } from "@/lib/validators/return";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormLabel,
  FormDescription,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: () => void;
  order: OrderCol;
};

const ReturnOrder = ({ open, onOpenChange, order }: Props) => {
  const router = useRouter();

  const [custom, setCustom] = useState(false);

  const form = useForm<ReturnValidator>({
    resolver: zodResolver(ReturnSchema),
    defaultValues: {
      reason: "",
      orderItemIds: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["send-return-request"],
    mutationFn: async (values: ReturnValidator) => {
      await axios.patch(`/api/orders/${order.id}/return`, values);
    },
    onSuccess: () => {
      toast.success("Your return request have submitted successfully.");

      router.refresh();

      onOpenChange();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = (values: ReturnValidator) => {
    mutate(values);
  };

  const onCloseHandler = () => {
    if (isPending) return;

    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onCloseHandler}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Item(s)?</DialogTitle>

          <DialogDescription>
            Submit your return request. We understand that sometimes things
            don&apos;t work out, and we&apos;re here to help make the process as
            smooth as possible.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="orderItemIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Order items</FormLabel>

                      <FormDescription>
                        Select the items you want to return.
                      </FormDescription>
                    </div>

                    <ScrollArea>
                      <div className="space-y-3 px-1">
                        {order.orderItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="orderItemIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex items-center gap-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                      disabled={isPending}
                                    />
                                  </FormControl>

                                  <FormLabel className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                        <Image
                                          className="object-cover"
                                          src={item.productItem.images[0]}
                                          fill
                                          alt="Order-item-img"
                                        />
                                      </div>

                                      <div className="flex flex-1 flex-col gap-1">
                                        <span className="font-semibold">
                                          {item.product.name}
                                        </span>

                                        <span className="text-sm text-gray-500">
                                          Qty: {item.quantity}
                                        </span>
                                      </div>

                                      <p className="font-bold">
                                        {formatPrice(
                                          item.availableItem.currentPrice,
                                          {
                                            currency: "USD",
                                          }
                                        )}
                                      </p>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {custom ? (
                <div>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>

                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            placeholder="Tell us the reason for your return"
                            disabled={isPending}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() => setCustom(false)}
                      disabled={isPending}
                    >
                      Choose
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose the reason for your return" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {reasonsForReturn.map((reason, i) => (
                              <SelectItem key={i} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() => setCustom(true)}
                      disabled={isPending}
                    >
                      Something Else
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex items-center gap-3 justify-end">
              <Button
                type="button"
                onClick={() => onOpenChange()}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" variant="outline" disabled={isPending}>
                Send
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnOrder;
