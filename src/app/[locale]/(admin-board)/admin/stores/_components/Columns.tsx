"use client";

import Image from "next/image";
import { Store } from "@prisma/client";
import CellActions from "./CellActions";
import { Check, X } from "lucide-react";
import { cn, getStatusColor } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export type CategoryCol = Store;

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
  { accessorKey: "country", header: "Country" },
  { accessorKey: "postcode", header: "Postcode" },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <div className="relative w-7 h-7 rounded-full overflow-hidden">
        <Image
          className="object-cover"
          src={row.original.logo || "/no-profile.jpeg"}
          fill
          alt=""
        />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={cn("font-bold", getStatusColor(row.original.status))}>
        {row.original.status}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
