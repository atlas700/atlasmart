"use client";

import React from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { AdminOrderStatusChange } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import {
  OrderStatusValidator,
  OrderStatusSchema,
} from "@/lib/validators/order-status";

type Props = {
  orderId: string;
  open: boolean;
  onOpenChange: () => void;
  currentStatus: AdminOrderStatusChange;
};

const StatusModal = ({ orderId, open, onOpenChange, currentStatus }: Props) => {
  const router = useRouter();

  const form = useForm<OrderStatusValidator>({
    resolver: zodResolver(OrderStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-order-status", orderId],
    mutationFn: async (values: OrderStatusValidator) => {
      await axios.patch(`/api/admin/orders/${orderId}`, values);
    },
    onSuccess: () => {
      toast.success("Order Status Updated!");

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
  const onSubmit = (values: OrderStatusValidator) => {
    mutate(values);
  };

  const onCloseHandler = () => {
    if (isPending) return;

    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onCloseHandler}>
      <DialogContent className="py-10">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Update Order Status
          </DialogTitle>

          <DialogDescription>Update current status of order.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value={OrderStatus.READYFORSHIPPING}>
                        Ready for Shipping
                      </SelectItem>

                      <SelectItem value={OrderStatus.SHIPPED}>
                        Shipped
                      </SelectItem>

                      <SelectItem value={OrderStatus.OUTFORDELIVERY}>
                        Out for Delivery
                      </SelectItem>

                      <SelectItem value={OrderStatus.DELIVERED}>
                        Delivered
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex items-center gap-3 justify-end">
              <Button
                type="button"
                onClick={() => onOpenChange()}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" variant="outline" disabled={isPending}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
