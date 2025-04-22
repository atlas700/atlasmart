"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreTable } from "@/drizzle/schema";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

type Props = {
  currentStore?: typeof StoreTable.$inferSelect;
  user: {
    name: string;
    id: string;
    email: string;
    clerkUserId: string;
    role: "USER" | "ADMIN" | "SELLER";
    imageUrl: string | null;
  };
};

const StoreAccount = ({ currentStore, user }: Props) => {
  if (!currentStore) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage
            className="object-cover"
            src={user?.imageUrl || "/no-profile.jpeg"}
          />
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[250px]" align="end">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/">Go to Homepage</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/${currentStore.id}/settings`}>
            Store Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <SignOutButton>Sign Out</SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoreAccount;
