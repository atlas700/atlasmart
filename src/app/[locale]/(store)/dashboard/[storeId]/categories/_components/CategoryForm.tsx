"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/components/modal/AlertModal";
import { CategoryValidator, CategorySchema } from "@/lib/validators/category";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CategoryTable } from "@/drizzle/schema";

type Props = {
  data?: typeof CategoryTable.$inferSelect;
};

const CategoryForm = ({ data }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<CategoryValidator>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: data?.name || "",
    },
  });

  const { mutate: onDelete, isPending: deleting } = useMutation({
    mutationKey: ["delete-category"],
    mutationFn: async () => {
      await axios.delete(
        `/api/stores/${params.storeId}/categories/${data?.id}`
      );
    },
    onSuccess: () => {
      toast.success("Category Deleted!");

      router.push(`/dashboard/${params.storeId}/categories`);

      router.refresh();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: data ? ["update-category"] : ["create-category"],
    mutationFn: async (values: CategoryValidator) => {
      if (data) {
        await axios.patch(
          `/api/stores/${params.storeId}/categories/${data.id}`,
          values
        );
      } else {
        await axios.post(
          `/api/stores/${params.storeId}/categories/new`,
          values
        );
      }
    },
    onSuccess: () => {
      toast.success(data ? "Category Updated!" : "Category Created!");

      router.push(`/dashboard/${params.storeId}/categories`);

      router.refresh();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = (values: CategoryValidator) => {
    mutate(values);
  };

  return (
    <div data-testid="category-form" data-cy="category-form">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={deleting}
        featureToDelete="category"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-sm"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Shoes..."
                    data-cy="category-name-input"
                  />
                </FormControl>

                <FormMessage data-cy="category-name-input-err" />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending}
              data-cy={data ? "category-save-btn" : "category-create-btn"}
            >
              {data ? "Save" : "Create"}
            </Button>

            {data && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setOpen(true)}
                disabled={isPending}
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CategoryForm;
