"use client";

import React, { useEffect, useState } from "react";
import qs from "query-string";
import { useRouter } from "next/navigation";
import { orderCategories } from "@/lib/utils";
import { Combobox } from "@/components/ui/combo-box";

type Props = {
  path: string;
};

const OrderFilters = ({ path }: Props) => {
  const router = useRouter();

  const [value, setValue] = useState("all");

  useEffect(() => {
    const pushToUrl = () => {
      const url = qs.stringifyUrl(
        {
          url: path,
          query: {
            status: value,
          },
        },
        { skipNull: true }
      );

      router.push(url);
    };

    pushToUrl();
  }, [path, value]);

  return (
    <Combobox frameworks={orderCategories} value={value} setValue={setValue} />
  );
};

export default OrderFilters;
