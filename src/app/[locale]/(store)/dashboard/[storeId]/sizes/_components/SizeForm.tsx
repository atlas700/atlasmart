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
import { SizeValidator, SizeSchema } from "@/lib/validators/size";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SizeTable } from "@/drizzle/schema";

type Props = {
  data?: typeof SizeTable.$inferSelect;
};

const SizeForm = ({ data }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<SizeValidator>({
    resolver: zodResolver(SizeSchema),
    defaultValues: {
      name: data?.name || "",
      value: data?.value || "",
    },
  });

  const { mutate: onDelete, isPending: deleting } = useMutation({
    mutationKey: ["delete-size"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/sizes/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Size Deleted!");

      router.push(`/dashboard/${params.storeId}/sizes`);

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
    mutationKey: data ? ["update-size"] : ["create-size"],
    mutationFn: async (values: SizeValidator) => {
      if (data) {
        await axios.patch(
          `/api/stores/${params.storeId}/sizes/${data.id}`,
          values
        );
      } else {
        await axios.post(`/api/stores/${params.storeId}/sizes/new`, values);
      }
    },
    onSuccess: () => {
      toast.success(data ? "Size Updated!" : "Size Created!");

      router.push(`/dashboard/${params.storeId}/sizes`);

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

  const onSubmit = (values: SizeValidator) => {
    mutate(values);
  };

  return (
    <div data-testid="size-form" data-cy="size-form">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={deleting}
        featureToDelete="size"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-2xl"
        >
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
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
                      placeholder="Large"
                      data-cy="size-name-input"
                    />
                  </FormControl>

                  <FormMessage data-cy="size-name-input-err" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="lg"
                      data-cy="size-value-input"
                    />
                  </FormControl>

                  <FormMessage data-cy="size-value-input-err" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending}
              data-cy={data ? "size-save-btn" : "size-create-btn"}
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

export default SizeForm;
