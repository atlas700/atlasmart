"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import BtnSpinner from "../BtnSpinner";
import ImageSlider from "../ImageSlider";
import { useParams } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ColorTable,
  ProductItemTable,
  productStatuses,
  ProductTable,
  SizeTable,
} from "@/drizzle/schema";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
};

type ProductType = typeof ProductTable.$inferSelect & {
  productItems: (typeof ProductItemTable.$inferSelect)[];
};

const ViewProductModal = ({ isOpen, onClose, productId }: Props) => {
  const params = useParams();

  const [mounted, setMounted] = useState(false);

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const [priceIndex, setPriceIndex] = useState(0);

  const [activeSize, setActiveSize] = useState<
    typeof SizeTable.$inferSelect | null
  >(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-modal", productId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/stores/${params.storeId}/products/${productId}`
      );

      return res.data as ProductType;
    },
  });

  const currentProductItem = product?.productItems[activeItemIndex];

  const {
    data: colors,
    isLoading: colorsLoading,
    isError: colorsError,
  } = useQuery({
    queryKey: ["product-modal-colors", currentProductItem?.id],
    queryFn: async () => {
      if (currentProductItem?.colorId.length === 0) return;

      const res = await axios.post(
        `/api/stores/${params.storeId}/colors/some`,
        { colorIds: currentProductItem?.colorId }
      );

      return res.data as (typeof ColorTable.$inferSelect)[];
    },
  });

  const currentSizes =
    // @ts-ignore
    currentProductItem?.availableItems?.map((item) => item.size) || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product?.status === productStatuses[2] ? "View" : "Preview"}{" "}
            Product
          </DialogTitle>

          <DialogDescription>
            This is a preview of how your product will be displayed to potential
            customers.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="w-full flex items-center justify-center py-4">
            <BtnSpinner />
          </div>
        )}

        {isError && (
          <div className="w-full flex items-center justify-center py-4">
            <p>No product found! Try again.</p>
          </div>
        )}

        {product && (
          <ScrollArea className="w-full h-[50vh] scrollbar-hide">
            <div className="space-y-6">
              {product.status !== "APPROVED" && (
                <div className="bg-red-100 p-2 rounded-lg">
                  <p className="text-sm text-red-500">
                    Your product is currently undergoing our review process and
                    will be made visible to customers once it receives approval.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h1 className="text-xl font-bold">{product.name}</h1>

                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <ImageSlider images={currentProductItem?.images ?? []} />

              <div className="flex items-center justify-between">
                {currentProductItem?.discount ? (
                  <div className="flex items-center gap-2 font-semibold">
                    <span>
                      {formatPrice(
                        // @ts-ignore
                        currentProductItem?.availableItems?.[priceIndex]
                          ?.currentPrice || 0,
                        {
                          currency: "GBP",
                        }
                      )}
                    </span>

                    <span className="line-through text-gray-500">
                      {formatPrice(
                        // @ts-ignore
                        currentProductItem?.availableItems?.[priceIndex]
                          ?.originalPrice || 0,
                        {
                          currency: "GBP",
                        }
                      )}
                    </span>

                    {currentProductItem?.discount > 0 && (
                      <span
                        className={cn(
                          currentProductItem?.discount > 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {currentProductItem?.discount}% off
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="font-semibold">
                    {formatPrice(
                      // @ts-ignore
                      currentProductItem?.availableItems?.[priceIndex]
                        ?.currentPrice || 0,
                      {
                        currency: "GBP",
                      }
                    )}
                  </div>
                )}
              </div>

              {currentSizes && currentSizes.length > 0 && (
                <div className="space-y-2">
                  <h1 className="text-lg font-bold">Sizes:</h1>

                  <div className="flex flex-wrap gap-3">
                    {currentSizes?.map((size: any, i: any) => (
                      <div
                        key={size?.id}
                        className={cn(
                          "p-2 text-sm border rounded-lg cursor-pointer",
                          activeSize?.id === size?.id &&
                            "border-2 border-black",
                          priceIndex === i && "border-2 border-black"
                        )}
                        onClick={() => {
                          setActiveSize(size);

                          setPriceIndex(i);
                        }}
                      >
                        {size?.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!colorsError &&
                !colorsLoading &&
                colors &&
                colors.length > 0 && (
                  <div className="space-y-2">
                    <h1 className="text-lg font-bold">Colors:</h1>

                    <div className="flex flex-wrap gap-2">
                      {colors?.map((color) => (
                        <div
                          key={color.id}
                          style={{ backgroundColor: color.value }}
                          className="w-5 h-5 rounded-full border"
                        />
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                <h1 className="text-lg font-bold">Choose Options:</h1>

                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {product?.productItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative w-20 h-20 border rounded-lg cursor-pointer overflow-hidden",
                        i === activeItemIndex && "border-2 border-black"
                      )}
                      onClick={() => setActiveItemIndex(i)}
                    >
                      <Image
                        className="object-cover"
                        fill
                        src={item.images[0]}
                        alt="product-item"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {product.status === productStatuses[2] && (
                <div className="text-violet-500 font-semibold">
                  <Link className="underline" href={`/products/${productId}`}>
                    User&apos;s View
                  </Link>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductModal;
