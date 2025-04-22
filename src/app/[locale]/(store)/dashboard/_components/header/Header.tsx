"use client";

import React from "react";
import StoreRoutes from "./StoreRoutes";
import StoreAccount from "../StoreAccount";
import StoreSwitcher from "../StoreSwitcher";
import Container from "@/components/Container";
import StoreMobileRoutes from "./StoreMobileRoutes";
import { useParams, usePathname } from "next/navigation";
import { StoreTable } from "@/drizzle/schema";

type Props = {
  stores: (typeof StoreTable.$inferSelect)[];
  user: {
    name: string;
    id: string;
    email: string;
    clerkUserId: string;
    role: "USER" | "ADMIN" | "SELLER";
    imageUrl: string | null;
  };
};

const Header = ({ stores, user }: Props) => {
  const params = useParams();

  const pathname = usePathname();

  const currentStore = stores?.find((store) => store.id === params.storeId);

  const routes = [
    {
      href: `/dashboard/${params?.storeId}`,
      label: "Overview",
      active: pathname === `/dashboard/${params?.storeId}`,
    },
    {
      href: `/dashboard/${params?.storeId}/banners`,
      label: "Banners",
      active: pathname === `/dashboard/${params?.storeId}/banners`,
    },
    {
      href: `/dashboard/${params?.storeId}/categories`,
      label: "Categories",
      active: pathname === `/dashboard/${params?.storeId}/categories`,
    },
    {
      href: `/dashboard/${params?.storeId}/sizes`,
      label: "Sizes",
      active: pathname === `/dashboard/${params?.storeId}/sizes`,
    },
    {
      href: `/dashboard/${params?.storeId}/colors`,
      label: "Colors",
      active: pathname === `/dashboard/${params?.storeId}/colors`,
    },
    {
      href: `/dashboard/${params?.storeId}/products`,
      label: "Products",
      active: pathname === `/dashboard/${params?.storeId}/products`,
    },
    {
      href: `/dashboard/${params?.storeId}/orders`,
      label: "Orders",
      active: pathname === `/dashboard/${params?.storeId}/orders`,
    },
  ];

  return (
    <header
      className="h-14 bg-white flex items-center border-b border-gray-200 shadow-sm"
      data-testid="store-nav"
    >
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StoreMobileRoutes routes={routes} />

            <StoreSwitcher stores={stores} />
          </div>

          <div className="hidden md:inline-flex mx-6 flex-1">
            <StoreRoutes routes={routes} />
          </div>

          <StoreAccount currentStore={currentStore} user={user} />
        </div>
      </Container>
    </header>
  );
};

export default Header;
