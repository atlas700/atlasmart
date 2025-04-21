"use client";

import { createStore } from "@/features/store/db/actions/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCountries from "@/hooks/use-countries";
import useStoreModal from "@/hooks/use-store-modal";
import { StoreSchema, StoreValidator } from "@/lib/validators/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import BtnSpinner from "./BtnSpinner";
import AuthError from "./auth/AuthError";
import AuthSuccess from "./auth/AuthSuccess";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const StoreForm = ({ isModal }: { isModal?: boolean }) => {
  const { getAll } = useCountries();

  const countries = getAll();

  const storeModal = useStoreModal();

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isPending, startTransition] = useTransition();

  const [showVerifyEmail, setShowVerifyEmail] = useState(false);

  const form = useForm<StoreValidator>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      postcode: "",
      code: "",
    },
  });

  const onSubmit = (values: StoreValidator) => {
    setError("");

    setSuccess("");

    startTransition(() => {
      createStore(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }

          if (data?.success) {
            form.reset();

            setSuccess(data.success);
          }

          if (data?.storeId) {
            storeModal.onClose();

            window.location.assign(`/dashboard/${data.storeId}`);
          }

          if (data?.verificationCode) {
            setShowVerifyEmail(true);
          }
        })
        .catch((err) => {
          setError("Something went wrong");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {showVerifyEmail ? (
            <div>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Verification Code</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type=""
                        disabled={isPending}
                        placeholder="123456"
                        data-cy="veriification-input"
                        autoComplete="new-password"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Store Name"
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage data-cy="store-name-err" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="user@mail.com"
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage data-cy="store-email-err" />
                  </FormItem>
                )}
              />

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
                        <SelectTrigger data-cy="country-select">
                          <SelectValue placeholder="Anywhere" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem
                            key={country.value}
                            value={country.value}
                            data-cy={`country-select-${country.value}`}
                          >
                            {country.flag} {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage data-cy="store-country-err" />
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
                      />
                    </FormControl>

                    <FormMessage data-cy="store-postcode-err" />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <AuthSuccess message={success} />

        <AuthError message={error} testId="create-store-err" />

        <div className="w-full flex items-center justify-end gap-2">
          {isModal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => storeModal.onClose()}
              disabled={isPending}
              data-cy="store-close-btn"
            >
              Cancel
            </Button>
          )}

          <Button type="submit" disabled={isPending} data-cy="store-submit-btn">
            {isPending ? (
              <BtnSpinner />
            ) : showVerifyEmail ? (
              "Confirm"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StoreForm;
