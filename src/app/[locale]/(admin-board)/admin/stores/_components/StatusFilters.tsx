"use client";

import React, { useEffect, useState } from "react";
import qs from "query-string";
import { storeCategories } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/combo-box";

const StatusFilters = () => {
  const router = useRouter();

  const [value, setValue] = useState("all");

  useEffect(() => {
    const pushToUrl = () => {
      const url = qs.stringifyUrl(
        {
          url: "/admin/stores",
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
    <Combobox frameworks={storeCategories} value={value} setValue={setValue} />
  );
};

export default StatusFilters;
