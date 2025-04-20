"use client";

import React, { useEffect, useState } from "react";
import qs from "query-string";
import { useRouter } from "next/navigation";
import { productCategories } from "@/lib/utils";
import { Combobox } from "@/components/ui/combo-box";

const ProductFilters = () => {
  const router = useRouter();

  const [value, setValue] = useState("all");

  useEffect(() => {
    const pushToUrl = () => {
      const url = qs.stringifyUrl(
        {
          url: "/admin/products",
          query: {
            status: value,
          },
        },
        { skipNull: true }
      );

      router.push(url);
    };

    pushToUrl();
  }, [value]);

  return (
    <Combobox
      frameworks={productCategories}
      value={value}
      setValue={setValue}
    />
  );
};

export default ProductFilters;
