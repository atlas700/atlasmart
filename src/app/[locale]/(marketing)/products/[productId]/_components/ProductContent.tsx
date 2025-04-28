"use client";

import AverageRating from "@/components/AverageRating";
import TooltipContainer from "@/components/TooltipContainer";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColorTable, SizeTable, userRoles } from "@/drizzle/schema";
import { addToCartHandler } from "@/features/cart/actions/cart";
import { cn, formatPrice } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ProductDetailType, ProductItemType } from "../../../../../../../types";
import ProductSlider from "./ProductSlider";

type Props = {
  product: ProductDetailType;
  user:
    | {
        role: "USER" | "ADMIN" | "SELLER";
        name: string;
        id: string;
        email: string;
        clerkUserId: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | undefined;
};

const ProductContent = ({ product, user }: Props) => {
  const queryClient = useQueryClient();

  const [curSize, setCurSize] = useState<
    typeof SizeTable.$inferSelect | undefined
  >(undefined);

  const [priceIndex, setPriceIndex] = useState(0);

  const [curProductItem, setCurProductItem] = useState<
    ProductItemType | undefined
  >(product.productItems?.[0]);

  const {
    data: colors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-details-colors", curProductItem?.id],
    queryFn: async () => {
      if (curProductItem?.colorIds.length === 0) return;

      const res = await axios.post(`/api/products/${product.id}/colors/some`, {
        colorIds: curProductItem?.colorIds,
      });

      return res.data as (typeof ColorTable.$inferSelect)[];
    },
  });

  const [curAvailableId, setCurAvailableId] = useState("");

  const currentSizes =
    curProductItem?.availableItems?.map((item: any) => ({
      availableItemId: item.id,
      size: item.size,
      inStock: item.numInStocks > 0,
      originalPrice: item.originalPrice,
      currentPrice: item.currentPrice,
    })) || [];

  const { mutate: addToCart, isPending } = useMutation({
    mutationKey: ["add-to-cart"],
    mutationFn: addToCartHandler,
    onSuccess: () => {
      toast.success("Item added to cart!");

      queryClient.invalidateQueries({
        queryKey: ["get-cart-item"],
      });
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  return (
    <div className="w-full grid md:grid-cols-2" data-testid="product-content">
      <ProductSlider images={curProductItem?.images || []} />

      <div className="py-5 md:py-0 md:pl-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <p className="text-gray-500">{product.category.name}</p>

          {product?.reviews?.length > 0 && (
            <AverageRating
              ratings={product?.reviews?.map((review: any) => review?.value)}
            />
          )}
        </div>

        <p className="my-2">{product.description}</p>

        <div className="text-lg">
          {curProductItem?.discount ? (
            <div className="flex items-center gap-2 font-semibold">
              <span>
                {formatPrice(currentSizes?.[priceIndex]?.currentPrice || 0, {
                  currency: "USD",
                })}
              </span>

              <span className="line-through text-gray-500">
                {formatPrice(currentSizes?.[priceIndex]?.originalPrice || 0, {
                  currency: "USD",
                })}
              </span>

              <span
                className={cn(
                  curProductItem?.discount > 1
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {curProductItem?.discount}% off
              </span>
            </div>
          ) : (
            <div className="font-semibold">
              {formatPrice(currentSizes?.[priceIndex]?.currentPrice || 0, {
                currency: "USD",
              })}
            </div>
          )}
        </div>

        <div className="w-full flex flex-wrap gap-2">
          {product.productItems.map((item: any) => (
            <button
              key={item.id}
              className={cn(
                "relative w-16 h-16 rounded-lg border border-gray-300 overflow-hidden disabled:cursor-not-allowed",
                curProductItem?.id === item.id && "border-2 border-black"
              )}
              onClick={() => setCurProductItem(item)}
              disabled={isPending}
            >
              <Image
                className="object-cover"
                fill
                src={item.images[0]}
                alt={`product-item-${item.id}`}
              />
            </button>
          ))}
        </div>

        {!isError && !isLoading && colors && colors.length > 0 && (
          <div className="space-y-2 mt-5">
            <h2 className="text-lg font-semibold">
              Product Color{colors.length > 1 ? "s" : ""}:
            </h2>

            <div className="w-full max-w-md flex flex-wrap gap-2">
              {colors.map((color) => (
                <TooltipContainer key={color.id} message={color.name}>
                  <div
                    style={{ backgroundColor: color.value }}
                    className="w-4 h-4 rounded-full border overflow-hidden"
                  />
                </TooltipContainer>
              ))}
            </div>
          </div>
        )}

        {currentSizes && currentSizes?.length > 0 && (
          <div className="space-y-2 mt-5">
            <h2 className="text-lg font-semibold">Available Sizes:</h2>

            <div className="w-full max-w-md flex flex-wrap gap-2">
              {currentSizes.map((item: any, i: number) => (
                <button
                  key={i}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg cursor-pointer border border-gray-300 overflow-hidden disabled:cursor-not-allowed",
                    curSize?.id === item?.size?.id && "border-2 border-black",
                    item.inStock
                      ? "opacity-100"
                      : "opacity-70 cursor-not-allowed"
                  )}
                  data-cy={`product-size-${product.id}-${i}`}
                  onClick={() => {
                    if (!item.inStock) return;

                    setPriceIndex(i);

                    setCurSize(item?.size);

                    setCurAvailableId(item.availableItemId);
                  }}
                  disabled={!item.inStock || isPending}
                >
                  {item?.size?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {user && user.role === userRoles[0] && (
          <div className="mt-4 mb-10">
            <TooltipContainer message="View Store">
              <Link
                href={`/stores/${product.storeId}`}
                data-cy="view-store-link"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={product?.store?.logo || "/no-profile.jpeg"}
                    />
                  </Avatar>

                  <p className="text-sm font-semibold">
                    {product?.store?.name}
                  </p>
                </div>
              </Link>
            </TooltipContainer>
          </div>
        )}

        {user && user.role === userRoles[0] && (
          <Button
            className="bg-violet-500 w-full md:max-w-md font-semibold rounded-full"
            size="lg"
            onClick={() =>
              addToCart({
                productId: product.id,
                productItemId: curProductItem?.id || "",
                availableItemId: curAvailableId,
              })
            }
            data-cy={`product-${product.id}-add-to-cart-btn`}
            disabled={isPending || !curProductItem || !curAvailableId}
          >
            Add To Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductContent;
