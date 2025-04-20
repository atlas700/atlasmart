"use client";

import React from "react";
import { Skeleton } from "./ui/skeleton";

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-b-lg shadow-sm">
      <div className="relative w-full aspect-video md:aspect-square overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="px-2 py-3">
        <Skeleton className="mt-4 w-2/3 h-4 rounded-lg" />

        <Skeleton className="mt-2 w-16 h-4 rounded-lg" />

        <Skeleton className="mt-3 w-12 h-4 rounded-lg" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
