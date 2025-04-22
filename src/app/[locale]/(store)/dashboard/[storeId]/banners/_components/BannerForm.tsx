"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Banner } from "@prisma/client";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import BannerUpload from "./BannerUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/components/modal/AlertModal";
import { BannerValidator, BannerSchema } from "@/lib/validators/banner";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  data?: Banner;
};

const BannerForm = ({ data }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<BannerValidator>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      name: data?.name || "",
      image: data?.image || "",
    },
  });

  const { mutate: onDelete, isPending: deleting } = useMutation({
    mutationKey: ["delete-banner"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/banners/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Banner Deleted!");

      router.push(`/dashboard/${params.storeId}/banners`);

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
    mutationKey: data ? ["update-banner", data.id] : ["create-category"],
    mutationFn: async (values: BannerValidator) => {
      if (data) {
        await axios.patch(
          `/api/stores/${params.storeId}/banners/${data.id}`,
          values
        );
      } else {
        await axios.post(`/api/stores/${params.storeId}/banners/new`, values);
      }
    },
    onSuccess: () => {
      toast.success(data ? "Banner Updated!" : "Banner Created!");

      router.push(`/dashboard/${params.storeId}/banners`);

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

  const onSubmit = (values: BannerValidator) => {
    mutate(values);
  };

  return (
    <div data-testid="banner-form" data-cy="banner-form">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={deleting}
        featureToDelete="banner"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-sm"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>

                  <FormControl>
                    <BannerUpload
                      storeId={params.storeId as string}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      testId="banner-upload"
                    />
                  </FormControl>

                  <FormMessage data-cy="banner-img-input-err" />
                </FormItem>
              )}
            />

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
                      placeholder="Name..."
                      data-cy="banner-name-input"
                    />
                  </FormControl>

                  <FormMessage data-cy="banner-name-input-err" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending}
              data-cy={data ? "banner-save-btn" : "banner-create-btn"}
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

export default BannerForm;
