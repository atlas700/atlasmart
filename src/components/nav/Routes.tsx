"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RouteType } from "../../../types";
import { useRouter } from "next/navigation";

type Props = {
  routes: RouteType[];
  className?: string;
  closeModal?: () => void;
};

const Routes = ({ routes, className, closeModal }: Props) => {
  const router = useRouter();

  const onClickHandler = (href: string) => {
    router.push(href);

    closeModal && closeModal();
  };

  return (
    <div className={cn("flex items-center gap-4 lg:gap-6", className)}>
      {routes.map((route) => (
        <button
          className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          }`}
          key={route.href}
          data-cy={`${route.label.toLowerCase()}-link`}
          onClick={() => onClickHandler(route.href)}
        >
          {route.label}
        </button>
      ))}
    </div>
  );
};

export default Routes;
