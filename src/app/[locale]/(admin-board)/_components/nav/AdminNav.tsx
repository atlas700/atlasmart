"use client";

import React from "react";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import UserAccount from "@/components/UserAccount";
import AdminRoutes from "./AdminRoutes";
import MobileAdminNav from "./MobileAdminNav";

const AdminNav = ({
  user,
}: {
  user: {
    name: string | undefined;
    imageUrl: string | null | undefined;
    role: "USER" | "ADMIN" | "SELLER" | undefined;
  };
}) => {
  const pathname = usePathname();

  const routes = [
    {
      href: `/admin`,
      label: "Overview",
      active: pathname === `/admin`,
    },
    {
      href: `/admin/users`,
      label: "Users",
      active: pathname === `/admin/users`,
    },
    {
      href: `/admin/stores`,
      label: "Stores",
      active: pathname === `/admin/stores`,
    },
    {
      href: `/admin/products`,
      label: "Products",
      active: pathname === `/admin/products`,
    },
    {
      href: `/admin/orders`,
      label: "Orders",
      active: pathname === `/admin/orders`,
    },
  ];
  return (
    <nav
      className="h-14 bg-white flex items-center border-b border-gray-200 shadow-sm"
      data-testid="admin-nav"
    >
      <Container>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <MobileAdminNav routes={routes} />

            <Logo />
          </div>

          <div className="hidden md:inline-flex flex-1">
            <AdminRoutes routes={routes} />
          </div>

          <UserAccount
            user={{
              imageUrl: user.imageUrl,
              name: user.name,
              role: user.role,
            }}
          />
        </div>
      </Container>
    </nav>
  );
};

export default AdminNav;
