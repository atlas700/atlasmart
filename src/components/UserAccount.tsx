"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@clerk/nextjs";

const UserAccount = ({
  user,
}: {
  user: {
    role: "USER" | "ADMIN" | "SELLER" | undefined;
    name: string | null | undefined;
    imageUrl: string | null | undefined;
  };
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-testid="user-account-trigger">
        <Avatar className="cursor-pointer">
          <AvatarImage
            src={user.imageUrl || "/no-profile.jpeg"}
            alt="user-profile"
          />
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[250px]" align="end">
        <DropdownMenuLabel>{user.name}&apos;s Account</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild data-testid="go-to-dashboard">
            <Link href={"/admin"}>Go to admin dashboard</Link>
          </DropdownMenuItem>
        )}

        {user.role !== "ADMIN" && (
          <DropdownMenuItem
            asChild
            data-testid={
              user.role === "USER" ? "become-a-seller" : "go-to-store"
            }
          >
            <Link href={"/store"}>
              {user.role === "USER" ? "Become a seller" : "Go to store"}
            </Link>
          </DropdownMenuItem>
        )}

        {user.role === "USER" && (
          <DropdownMenuItem asChild>
            <Link href={"/orders"}>My Orders</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href={"/settings"}>Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccount;
