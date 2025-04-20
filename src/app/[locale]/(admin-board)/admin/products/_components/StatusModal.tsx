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
import { Product, ProductStatus } from "@prisma/client";
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

type Props = {
  open: boolean;
  onOpenChange: () => void;
  data: Product;
};

const StatusModal = ({ open, onOpenChange, data }: Props) => {
  const router = useRouter();

  const form = useForm<ProductStatusValidator>({
    resolver: zodResolver(ProductStatusSchema),
    defaultValues: {
      status: data.status,
      statusFeedback: data.statusFeedback,
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
                        <SelectItem value={ProductStatus.PENDING}>
                          Pending
                        </SelectItem>

                        <SelectItem value={ProductStatus.REVIEWING}>
                          Reviewing
                        </SelectItem>

                        <SelectItem value={ProductStatus.APPROVED}>
                          Approved
                        </SelectItem>

                        <SelectItem value={ProductStatus.DECLINED}>
                          Declined
                        </SelectItem>

                        <SelectItem value={ProductStatus.ARCHIVED}>
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
