"use client";

import React from "react";
import AddBtn from "./AddBtn";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Available, Size } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import SizeModal from "@/components/modal/SizeModal";
import { ProductValidator } from "@/lib/validators/product";
import { UseFormReturn, useFieldArray, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  form: UseFormReturn<ProductValidator>;
  index: number;
  sizes: Size[];
  disabled: boolean;
  availableItems: Available[];
  productId: string | undefined;
  testId?: string;
};

const AvailableForm = ({
  form,
  index,
  sizes,
  disabled,
  testId,
  productId,
  availableItems,
}: Props) => {
  const params = useParams();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `productItems.${index}.availableItems`,
  });

  const { mutate: deleteItem, isPending } = useMutation({
    mutationKey: ["delete-available-item"],
    mutationFn: async (id: string) => {
      if (!id || !productId) return;

      await axios.delete(
        `/api/stores/${params.storeId}/products/${productId}/available-item/${id}`
      );
    },
    onSuccess: () => {
      toast.success("Item deleted successfully");

      window.location.reload();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-lg font-bold">Add Size</h4>

        <AddBtn
          onClick={() =>
            append({
              id: "",
              sizeId: "",
              price: 0,
              numInStocks: 0,
            })
          }
          testId="add-new-size"
          cypressTestId={`${testId}-add`}
          disabled={disabled || isPending}
        />
      </div>

      <div className="space-y-6">
        {fields.map((item, i) => (
          <div
            key={item.id}
            className="w-full max-w-2xl space-y-4"
            data-cy={`${testId}-${i}`}
          >
            <div className="w-full grid md:grid-cols-2 gap-4">
              <Controller
                name={`productItems.${index}.availableItems.${i}.sizeId`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span>Size</span>

                      <SizeModal>
                        <AddBtn disabled={disabled || isPending} />
                      </SizeModal>
                    </FormLabel>

                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled || isPending}
                      >
                        <FormControl>
                          <SelectTrigger data-cy={`${testId}-${i}-size-select`}>
                            <SelectValue placeholder="Choose Size" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {sizes.map((size: Size, idx: number) => (
                            <SelectItem
                              key={size.id}
                              value={size.id}
                              data-cy={`${testId}-select-size-${idx}`}
                            >
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                name={`productItems.${index}.availableItems.${i}.price`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (£)</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min={0}
                        disabled={disabled || isPending}
                        placeholder="Price"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                name={`productItems.${index}.availableItems.${i}.numInStocks`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number In Stock</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        disabled={disabled || isPending}
                        placeholder="Number in Stock"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end">
              {availableItems[i]?.id ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => deleteItem(availableItems[i].id)}
                  disabled={disabled || isPending}
                >
                  Delete Item
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => remove(i)}
                  disabled={disabled || isPending}
                >
                  Remove Size
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableForm;
