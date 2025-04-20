"use client";

import Image from "next/image";
import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

export type CategoryCol = User;

export const columns: ColumnDef<CategoryCol>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => (
      <>
        {row.original.emailVerified ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <X className="w-4 h-4 text-red-500" />
        )}
      </>
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative w-7 h-7 rounded-full overflow-hidden">
        <Image
          className="object-cover"
          src={row.original.image || "/no-profile.jpeg"}
          fill
          alt=""
        />
      </div>
    ),
  },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "isTwoFactorEnabled",
    header: "Is Two Factor Enabled",
  },
];
