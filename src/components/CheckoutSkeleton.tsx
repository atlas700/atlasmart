"use client";

import React from "react";
import { Skeleton } from "./ui/skeleton";

const CheckoutSkeleton = () => {
  return (
    <div className="bg-white p-5 space-y-4 rounded-lg border-none shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg" />

          <div className="flex flex-col gap-0.5">
            <Skeleton className="w-20 h-4 rounded-lg" />

            <Skeleton className="w-20 h-4 rounded-lg" />

            <Skeleton className="w-20 h-4 rounded-lg" />
          </div>
        </div>

        <Skeleton className="w-20 h-4 rounded-lg" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-lg" />

          <Skeleton className="w-10 h-4 rounded-lg" />

          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>

        <Skeleton className="w-36 h-10 rounded-lg" />
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
