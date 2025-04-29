"use client";

import React, { useEffect, useRef } from "react";
import Empty from "@/components/Empty";
import { HomeProductType } from "../../../../../../../types";
import Spinner from "@/components/Spinner";
import ProductSkeleton from "@/components/ProductSkeleton";
import Product from "../../../_components/Product";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/lib/utils";
import useUnlimitedScrolling from "@/hooks/use-unlimited-scrolling";

type Props = {
  storeId: string;
  searchValue: string;
  initialData: HomeProductType[];
};

const StoreFeed = ({ storeId, searchValue, initialData }: Props) => {
  const productRef = useRef<HTMLDivElement>(null);

  const {
    ref,
    entry,
    data,
    error,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useUnlimitedScrolling({
    key: ["search-store-products", searchValue],
    query: `/api/stores/${storeId}/search?q=${
      searchValue || ""
    }&limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`,
    initialData,
  });

  //@ts-ignore
  const products: HomeProductType[] =
    data?.pages?.flatMap((page) => page) ?? initialData;

  //When you scroll to the bottom it triggers the fetchNextPage() to fetch more products
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    productRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [searchValue]);

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {new Array(20).fill("").map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products?.length === 0) {
    return (
      <Empty
        message="Sorry, no products found! Try again later."
        testId="store-product-search-empty"
      />
    );
  }

  console.log(products);

  return (
    <>
      <div
        ref={productRef}
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
      >
        {products?.map((product, i) => {
          if (i === products.length - 1) {
            return (
              <div key={product.id} ref={ref}>
                <Product product={product} />
              </div>
            );
          } else {
            return <Product key={product.id} product={product} />;
          }
        })}
      </div>

      {isFetchingNextPage && <Spinner />}

      {error && (
        <div className="py-5 text-center text-sm text-red-500 font-medium">
          Could not get products! Try refreshing the page.
        </div>
      )}
    </>
  );
};

export default StoreFeed;
