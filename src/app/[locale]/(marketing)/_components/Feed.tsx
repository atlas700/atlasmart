"use client";

import Empty from "@/components/Empty";
import ProductSkeleton from "@/components/ProductSkeleton";
import Spinner from "@/components/Spinner";
import useUnlimitedScrolling from "@/hooks/use-unlimited-scrolling";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/lib/utils";
import { useEffect } from "react";
import { HomeProductType } from "../../../../../types";
import Product from "./Product";

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

  // Make sure we have a stable, consistent data structure
  const products = data?.pages
    ? data.pages.flatMap((page: any) => (page?.length ? page : []))
    : initialData || [];

  // When you scroll to the bottom it triggers the fetchNextPage() to fetch more products
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  // Show loading state only on initial load, not when we have products already
  if (isLoading && products.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(20)].map((_, i) => (
          <ProductSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <Empty message="Sorry, no products found! Try again later." />;
  }

  return (
    <>
      <div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        data-testid="product-feed"
      >
        {Array.isArray(products) &&
          products.map((product, i) => {
            // Make sure product is valid
            if (!product || !product.id) {
              return null;
            }

            // Last item gets the ref for infinite scrolling
            if (i === products.length - 1) {
              return (
                <div key={`product-${product.id}`} ref={ref}>
                  <Product product={product} />
                </div>
              );
            }

            // All other items
            return <Product key={`product-${product.id}`} product={product} />;
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
