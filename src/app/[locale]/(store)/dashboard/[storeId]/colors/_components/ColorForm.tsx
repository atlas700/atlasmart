"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { SketchPicker } from "react-color";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/components/modal/AlertModal";
import { ColorValidator, ColorSchema } from "@/lib/validators/color";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ColorTable } from "@/drizzle/schema";

type Props = {
  data?: typeof ColorTable.$inferSelect;
};

const ColorForm = ({ data }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<ColorValidator>({
    resolver: zodResolver(ColorSchema),
    defaultValues: {
      name: data?.name || "",
      value: data?.value || "",
    },
  });

  const { mutate: onDelete, isPending: deleting } = useMutation({
    mutationKey: ["delete-color"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/colors/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Color Deleted!");

      router.push(`/dashboard/${params.storeId}/colors`);

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
    mutationKey: data ? ["update-color"] : ["create-color"],
    mutationFn: async (values: ColorValidator) => {
      if (data) {
        await axios.patch(
          `/api/stores/${params.storeId}/colors/${data.id}`,
          values
        );
      } else {
        await axios.post(`/api/stores/${params.storeId}/colors/new`, values);
      }
    },
    onSuccess: () => {
      toast.success(data ? "Color Updated!" : "Color Created!");

      router.push(`/dashboard/${params.storeId}/colors`);

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

  const onSubmit = (values: ColorValidator) => {
    mutate(values);
  };

  return (
    <div data-testid="color-form" data-cy="color-form">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={deleting}
        featureToDelete="color"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-sm"
        >
          <div className="flex flex-col gap-4">
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
                      placeholder="Black"
                      data-cy="color-name-input"
                    />
                  </FormControl>

                  <FormMessage data-cy="color-name-input-err" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem data-cy="color-value-input">
                  <FormLabel>Value</FormLabel>

                  <FormControl>
                    <SketchPicker
                      color={field.value}
                      onChange={(color) => field.onChange(color.hex)}
                    />
                  </FormControl>

                  <FormMessage data-cy="color-value-input-err" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending}
              data-cy={data ? "color-save-btn" : "color-create-btn"}
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

export default ColorForm;
