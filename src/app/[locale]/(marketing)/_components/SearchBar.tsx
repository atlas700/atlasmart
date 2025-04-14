"use client";

import React, { useState } from "react";
import { XIcon, SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const query = searchParams.get("query");

  const [value, setValue] = useState(query || "");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (value.trim() === "") return;

    router.push(`/products/search?query=${value}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      data-cy="product-search-bar"
      className="w-full h-10 bg-background flex gap-3 border border-input px-3 py-2 rounded-md text-sm ring-offset-background "
    >
      <input
        className="w-full flex-1 outline-none"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-cy="product-search-bar-input"
      />

      {value.trim() && (
        <button
          type="button"
          className="flex items-center justify-center"
          onClick={() => setValue("")}
          data-cy="product-search-bar-input-clear"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}

      <button
        type="submit"
        className="flex items-center justify-center"
        data-cy="product-search-bar-input-search"
      >
        <SearchIcon className="w-4 h-4" />
      </button>
    </form>
  );
}
