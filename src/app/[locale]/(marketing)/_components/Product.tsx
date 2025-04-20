"use client";

import React from "react";
import ProductImg from "./ProductImg";
import { HomeProductType } from "../../../../../types";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import AverageRating from "@/components/AverageRating";

type Props = {
  product: HomeProductType;
};

const Product = ({ product }: Props) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div
      className="bg-white border border-gray-300 rounded-b-lg cursor-pointer shadow-sm transition"
      onClick={onClick}
      data-testid="product-item"
      data-cy={`feed-product-${product.id}`}
    >
      <ProductImg
        images={product?.productItems?.map((item: any) => item.images[0]) || []}
      />

      <div className="px-2 py-3">
        <h2
          className="w-full text-lg font-bold truncate"
          aria-label={product.name}
        >
          {product.name}
        </h2>

        <p className="text-sm text-gray-500">{product.category?.name}</p>

        {product?.reviews?.length > 0 ? (
          <AverageRating
            className="my-2"
            ratings={product.reviews.map((review: any) => review.value)}
          />
        ) : (
          <div className="py-3" />
        )}

        <div className="text-sm my-2">
          {product.productItems?.[0]?.discount ? (
            <div className="flex items-center gap-2 font-semibold">
              <span>
                {formatPrice(
                  product.productItems?.[0]?.availableItems?.[0]
                    ?.currentPrice || 0,
                  {
                    currency: "GBP",
                  }
                )}
              </span>

              <span className="line-through text-gray-500">
                {formatPrice(
                  product.productItems?.[0]?.availableItems?.[0]
                    ?.originalPrice || 0,
                  {
                    currency: "GBP",
                  }
                )}
              </span>

              <span
                className={cn(
                  product.productItems?.[0]?.discount > 1
                    ? "text-green-600"
                    : "text-red-500"
                )}
              >
                {product.productItems?.[0]?.discount}% off
              </span>
            </div>
          ) : (
            <div className="font-semibold">
              {formatPrice(
                product.productItems?.[0]?.availableItems?.[0]?.currentPrice ||
                  0,
                {
                  currency: "GBP",
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
