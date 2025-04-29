"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

type Props = {
  storeId: string;
};

const ProductFilters = ({ storeId }: Props) => {
  const router = useRouter();

  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    router.push(`/stores/${storeId}?search=${value}`);
  };

  useEffect(() => {
    if (value.trim() === "") {
      router.push(`/stores/${storeId}`);
    }
  }, [value, router, storeId]);

  return (
    <form
      onSubmit={onSubmit}
      data-cy="store-product-search-bar"
      className="w-full max-w-96 h-10 bg-background flex gap-3 border border-input px-3 py-2 rounded-md text-sm ring-offset-background"
    >
      <input
        className="w-full flex-1 outline-none"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-cy="store-product-search-bar-input"
      />

      {value.trim() && (
        <button
          type="button"
          className="flex items-center justify-center"
          onClick={() => setValue("")}
          data-cy="store-product-search-bar-input-clear"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}

      <button
        type="submit"
        className="flex items-center justify-center"
        data-cy="store-product-search-bar-input-search"
      >
        <SearchIcon className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ProductFilters;
