"use client";

import React from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductStatusValidator,
  ProductStatusSchema,
} from "@/lib/validators/product-status";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { productStatuses, ProductTable } from "@/drizzle/schema";

type Props = {
  open: boolean;
  onOpenChange: () => void;
  data: typeof ProductTable.$inferSelect;
};

const StatusModal = ({ open, onOpenChange, data }: Props) => {
  const router = useRouter();

  const form = useForm<ProductStatusValidator>({
    resolver: zodResolver(ProductStatusSchema),
    defaultValues: {
      status: data.status,
      statusFeedback: data.statusFeedback!,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-product-status"],
    mutationFn: async (values: ProductStatusValidator) => {
      await axios.patch(`/api/admin/products/${data.id}`, values);
    },
    onSuccess: () => {
      toast.success("Status Updated!");

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

  const onSubmit = (values: ProductStatusValidator) => {
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-10">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Update Status
          </DialogTitle>

          <DialogDescription>
            Update current status of products.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                        <SelectItem value={productStatuses[0]}>
                          Pending
                        </SelectItem>

                        <SelectItem value={productStatuses[1]}>
                          Reviewing
                        </SelectItem>

                        <SelectItem value={productStatuses[2]}>
                          Approved
                        </SelectItem>

                        <SelectItem value={productStatuses[3]}>
                          Declined
                        </SelectItem>

                        <SelectItem value={productStatuses[4]}>
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Feedback</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Write something..."
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
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
