"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { UserTable } from "@/drizzle/schema";

export type CategoryCol = typeof UserTable.$inferSelect;

export const columns: ColumnDef<CategoryCol>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  // {
  //   accessorKey: "emailVerified",
  //   header: "Email Verified",
  //   cell: ({ row }) => (
  //     <>
  //       {row.original.emailVerified ? (
  //         <Check className="w-4 h-4 text-green-500" />
  //       ) : (
  //         <X className="w-4 h-4 text-red-500" />
  //       )}
  //     </>
  //   ),
  // },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative w-7 h-7 rounded-full overflow-hidden">
        <Image
          className="object-cover"
          src={row.original.imageUrl || "/no-profile.jpeg"}
          fill
          alt=""
        />
      </div>
    ),
  },
  { accessorKey: "role", header: "Role" },
  // {
  //   accessorKey: "isTwoFactorEnabled",
  //   header: "Is Two Factor Enabled",
  // },
];
