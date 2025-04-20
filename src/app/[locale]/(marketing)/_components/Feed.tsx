"use client";

import React, { useEffect } from "react";
import Product from "./Product";
import Empty from "@/components/Empty";
import { HomeProductType } from "../../../../../types.d";
import Spinner from "@/components/Spinner";
import ProductSkeleton from "@/components/ProductSkeleton";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/lib/utils";
import useUnlimitedScrolling from "@/hooks/use-unlimited-scrolling";

type Props = {
  initialData: HomeProductType[];
};

const Feed = ({ initialData }: Props) => {
  const {
    ref,
    entry,
    data,
    error,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useUnlimitedScrolling({
    key: "feed-products",
    query: `/api/products?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`,
    initialData,
  });

  //@ts-ignore
  const products: ProductType[] =
    data?.pages?.flatMap((page: any) => page) ?? initialData;

  //When you scroll to the bottom it triggers the fetchNextPage() to fetch more products
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  if (products.length === 0) {
    return <Empty message="Sorry, no products found! Try again later." />;
  }

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {new Array(20).fill("").map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        data-testid="product-feed"
      >
        {products.map((product, i) => {
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

export default Feed;
