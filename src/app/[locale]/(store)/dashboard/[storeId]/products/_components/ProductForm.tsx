"use client";

import BtnSpinner from "@/components/BtnSpinner";
import ImageUpload from "@/components/ImageUpload";
import AlertModal from "@/components/modal/AlertModal";
import CategoryModal from "@/components/modal/CategoryModal";
import ColorModal from "@/components/modal/ColorModal";
import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AvailableItemTable,
  CategoryTable,
  ColorTable,
  ProductItemTable,
  ProductTable,
  SizeTable,
} from "@/drizzle/schema";
import { ProductSchema, ProductValidator } from "@/lib/validators/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import AddBtn from "./AddBtn";
import AvailableForm from "./AvailableForm";

type ProductItemType = typeof ProductItemTable.$inferSelect & {
  availableItems: (typeof AvailableItemTable.$inferSelect)[];
};

type Props = {
  data?: typeof ProductTable.$inferSelect & {
    productItems: ProductItemType[];
  };
  currentUser: {
    role: "USER" | "ADMIN" | "SELLER";
    name: string;
    id: string;
    email: string;
    clerkUserId: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

const ProductForm = ({ data, currentUser }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [honeyPot, setHoneyPot] = useState("");

  const formattedProductItems = data?.productItems.map((item) => ({
    id: item.id,
    colorIds: item.colorIds || [],
    discount: item.discount,
    availableItems:
      item.availableItems.map((item) => ({
        id: item.id,
        numInStocks: item.numInStocks,
        sizeId: item.sizeId,
        price: item.originalPrice,
      })) || [],
    images: item.images || [],
  }));

  const form = useForm<ProductValidator>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: data?.name || "",
      categoryId: data?.categoryId || "",
      description: data?.description || "",
      productItems: formattedProductItems || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productItems",
  });

  const {
    data: categories,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["product-category"],
    queryFn: async () => {
      const res = await axios.get(`/api/stores/${params.storeId}/categories`);

      return res.data;
    },
  });

  const { data: sizes } = useQuery({
    queryKey: ["product-sizes"],
    queryFn: async () => {
      const res = await axios.get(`/api/stores/${params.storeId}/sizes`);

      return res.data as (typeof SizeTable.$inferSelect)[];
    },
  });

  const {
    data: colors,
    error: colorsError,
    isLoading: colorsLoading,
  } = useQuery({
    queryKey: ["product-colors"],
    queryFn: async () => {
      const res = await axios.get(`/api/stores/${params.storeId}/colors`);

      return res.data as (typeof ColorTable.$inferSelect)[];
    },
  });

  const { mutate: deleteItem, isPending: deletingItem } = useMutation({
    mutationKey: ["delete-product-item"],
    mutationFn: async (id: string) => {
      if (!id || !data?.id) return;

      await axios.delete(
        `/api/stores/${params.storeId}/products/${data?.id}/items/${id}`
      );
    },
    onSuccess: () => {
      toast.success("Item deleted successfully");

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

  const { mutate: onDeleteProduct, isPending: deletingProduct } = useMutation({
    mutationKey: ["delete-product"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/products/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Product Deleted!");

      router.push(`/dashboard/${params.storeId}/products`);

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

  const { mutate: createProduct, isPending: creating } = useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (values: ProductValidator) => {
      await axios.post(`/api/stores/${params.storeId}/products/new`, values);
    },
    onSuccess: () => {
      toast.success("Product Created!");

      router.push(`/dashboard/${params.storeId}/products`);

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

  const { mutate: updateProduct, isPending: updating } = useMutation({
    mutationKey: ["update-product", data?.id],
    mutationFn: async (values: ProductValidator) => {
      if (!data?.id) return;

      await axios.patch(
        `/api/stores/${params.storeId}/products/${data?.id}`,
        values
      );
    },
    onSuccess: () => {
      toast.success("Product Updated!");

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

  const onSubmit = async (values: ProductValidator) => {
    console.log("BEFORE HONEY POT", values);

    if (honeyPot) return;
    console.log("AFTER HONEY POT", values);

    if (data) {
      updateProduct(values);
    } else {
      createProduct(values);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDeleteProduct}
        loading={deletingProduct}
        featureToDelete="product"
      />

      <div data-testid="product-form" data-cy="product-form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="hidden">
                <input
                  type="text"
                  value={honeyPot}
                  onChange={(e) => setHoneyPot(e.target.value)}
                />
              </div>

              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          disabled={creating || updating || deletingItem}
                          placeholder="Name..."
                          data-cy="product-name-input"
                        />
                      </FormControl>

                      <FormMessage data-cy="product-name-input-err" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span>Category</span>

                        <CategoryModal>
                          <AddBtn
                            testId="add-new-category"
                            disabled={creating || updating || deletingItem}
                          />
                        </CategoryModal>
                      </FormLabel>

                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={creating || updating || deletingItem}
                        >
                          <FormControl>
                            <SelectTrigger data-cy="product-category-select-trigger">
                              <SelectValue placeholder="Choose Category" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {isLoading && (
                              <div className="py-4">
                                <BtnSpinner />
                              </div>
                            )}

                            {categories?.length === 0 && (
                              <div className="flex items-center justify-center py-4 text-sm">
                                No category found! Create a new category.
                              </div>
                            )}

                            {!isLoading && !error && categories && (
                              <>
                                {categories?.map(
                                  (
                                    cat: typeof CategoryTable.$inferSelect,
                                    i: number
                                  ) => (
                                    <SelectItem
                                      key={cat.id}
                                      value={cat.id}
                                      data-cy={`product-category-select-${i}`}
                                    >
                                      {cat.name}
                                    </SelectItem>
                                  )
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage data-cy="product-category-input-err" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>

                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={creating || updating || deletingItem}
                          placeholder="Product Description..."
                          data-cy="product-description-input"
                          rows={10}
                        />
                      </FormControl>

                      <FormMessage data-cy="product-description-input-err" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-16 lg:pt-10" />

            {form.formState.errors.productItems && (
              <div className="text-red-500 text-sm">
                {form.formState.errors.productItems.message}
              </div>
            )}

            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold">Add Product Details</h4>

              <button
                type="button"
                className="bg-blue-400 w-5 h-5 flex items-center justify-center rounded-full overflow-hidden disabled:cursor-not-allowed"
                onClick={() =>
                  append({
                    id: "",
                    images: [],
                    colorIds: [],
                    discount: 0,
                    availableItems: [],
                  })
                }
                data-testid="add-product-item"
                data-cy="add-product-item"
                disabled={creating || updating || deletingItem}
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-4"
                  data-testid="product-item-form"
                  data-cy={`product-item-form-${index}`}
                >
                  <Controller
                    name={`productItems.${index}.images`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images (Max 6)</FormLabel>

                        <FormControl>
                          <ImageUpload
                            forProduct
                            value={field.value}
                            onChange={field.onChange}
                            disabled={creating || updating || deletingItem}
                            storeId={params.storeId as string}
                            testId={`product-item-form-${index}-upload`}
                            currentUser={currentUser}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AvailableForm
                    form={form}
                    index={index}
                    sizes={sizes || []}
                    productId={data?.id || undefined}
                    disabled={creating || updating || deletingItem}
                    availableItems={
                      data?.productItems?.[index]?.availableItems || []
                    }
                    testId={`product-item-form-${index}-available`}
                  />

                  <div className="w-full grid items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Controller
                      name={`productItems.${index}.colorIds`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <span>Colors</span>

                            <ColorModal>
                              <AddBtn
                                testId="add-color-btn"
                                disabled={creating || updating || deletingItem}
                              />
                            </ColorModal>
                          </FormLabel>

                          <FormControl>
                            {!colorsError &&
                              !colorsLoading &&
                              colors &&
                              colors.length > 0 && (
                                <MultiSelect
                                  options={colors.map((color) => ({
                                    value: color.id,
                                    label: color.name,
                                  }))}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Choose Colors..."
                                  testId={`product-item-form-${index}-color`}
                                />
                              )}
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Controller
                      name={`productItems.${index}.discount`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min={0}
                              disabled={creating || updating || deletingItem}
                              placeholder="Discount"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    {data?.productItems?.[index]?.id ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          remove(index);

                          deleteItem(data.productItems[index]!.id);
                        }}
                        disabled={creating || updating || deletingItem}
                        data-cy={`product-item-form-${index}-delete`}
                      >
                        Delete Item
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        data-testid="remove-product-item"
                        data-cy={`product-item-form-${index}-remove`}
                        variant="secondary"
                        onClick={() => remove(index)}
                        disabled={creating || updating || deletingItem}
                      >
                        Remove Item
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex items-center justify-between gap-3">
              {data && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/${params.storeId}/products`)
                  }
                  disabled={creating || updating || deletingItem}
                  data-cy="back-btn"
                >
                  Back to products
                </Button>
              )}

              <div className="flex items-center gap-3">
                <Button
                  className="disabled:cursor-not-allowed disabled:opacity-75"
                  type="submit"
                  disabled={creating || updating || deletingItem}
                  data-cy={data ? `product-save-btn` : "product-create-btn"}
                >
                  {data ? "Save" : "Create"}
                </Button>

                {data && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setOpen(true)}
                    disabled={creating || updating || deletingItem}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ProductForm;
