"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import StoreLogo from "./StoreLogo";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BtnSpinner from "@/components/BtnSpinner";
import useCountries from "@/hooks/use-countries";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StoreSettingsValidator,
  StoreSettingsSchema,
} from "@/lib/validators/storeSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { StoreTable } from "@/drizzle/schema";

type Props = {
  store: typeof StoreTable.$inferSelect;
};

const SettingsForm = ({ store }: Props) => {
  const router = useRouter();

  const [invalid, setInvalid] = useState(false);

  const form = useForm<StoreSettingsValidator>({
    resolver: zodResolver(StoreSettingsSchema),
    defaultValues: {
      name: store?.name || "",
      logo: store?.logo || undefined,
      country: store?.country || "",
      postcode: store?.postCode || "",
      description: store?.description || undefined,
    },
  });

  const { getAll } = useCountries();

  const countries = getAll();

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-store", store?.id],
    mutationFn: async (values: StoreSettingsValidator) => {
      if (!store?.id) return;

      await axios.patch(`/api/stores/${store.id}`, values);
    },
    onSuccess: () => {
      toast.success("Store Updated!");

      router.refresh();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);

        setInvalid(true);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = (values: StoreSettingsValidator) => {
    setInvalid(false);

    mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-cy="store-settings-form"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>

                <FormControl>
                  <StoreLogo
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    storeId={store?.id || ""}
                    testId="store-image-upload"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full sm:max-w-sm">
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
                      data-testid="store-name-input"
                      data-cy="store-name-input"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-xl">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="store-country-select-trigger"
                        data-cy="store-country-select-trigger"
                      >
                        <SelectValue placeholder="Anywhere" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.value}
                          value={country.value}
                          data-cy={`store-country-select-${country.value}`}
                        >
                          {country.flag} {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123456"
                      disabled={isPending}
                      data-testid="store-postcode-input"
                      data-cy="store-postcode-input"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>

                <FormControl>
                  <Textarea
                    className="max-w-lg"
                    rows={6}
                    placeholder="Store Description..."
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    data-testid="store-description-input"
                    data-cy="store-description-input"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="mt-20 sm:mt-16 disabled:cursor-not-allowed disabled:opacity-75"
          type="submit"
          disabled={isPending}
          data-testid="save-store-details"
          data-cy="save-store-details"
        >
          {isPending ? <BtnSpinner /> : "Save"}
        </Button>

        {invalid && <div data-cy="invalid-err" />}
      </form>
    </Form>
  );
};

export default SettingsForm;
