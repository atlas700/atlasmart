"use client";

import Container from "@/components/Container";
import Spinner from "@/components/Spinner";
import { getRecommendedProducts } from "@/features/products/db/products";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { RecommendedType } from "../../../../../../../types";
import Product from "../../../_components/Product";

type Props = {
  product: RecommendedType;
};

const Recommendation = ({ product }: Props) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const [isMoved, setIsMoved] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-recommended-product", product.id],
    queryFn: async () => {
      const products = await getRecommendedProducts(product);

      return products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleClick = (direction: string) => {
    setIsMoved(true);

    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;

      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-5 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (products?.length === 0 || isError) {
    return null;
  }

  return (
    <Container>
      <div className="py-10 space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold">You Might Also Like</h1>

        {products && products?.length > 1 && (
          <div className="flex items-center justify-end gap-3">
            <button
              className={cn(
                "bg-black/60 items-center justify-center p-2 text-white rounded-full",
                !isMoved ? "hideen" : "inline-flex"
              )}
              onClick={(e) => handleClick("left")}
            >
              <ArrowLeft />
            </button>

            <button
              className={cn(
                "bg-black/60 items-center justify-center p-2 text-white rounded-full"
              )}
              onClick={() => handleClick("right")}
            >
              <ArrowRight />
            </button>
          </div>
        )}

        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-scroll scrollbar-hide"
        >
          {!isLoading &&
            !isError &&
            Array.isArray(products) &&
            products.map((product, i) => (
              <div key={product.product.id} className="min-w-[350px]">
                <Product product={product} />
              </div>
            ))}
        </div>
      </div>
    </Container>
  );
};

export default Recommendation;
