"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Banner } from "@prisma/client";
import CellActions from "./CellActions";
import { Check, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export type BannerCol = Banner;

export const columns: ColumnDef<BannerCol>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
        <Image
          className="object-cover"
          src={row.original.image}
          fill
          alt="banner-image"
        />
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <>
        {row.original.active ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <X className="w-4 h-4 text-red-500" />
        )}
      </>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div>{format(row.original.createdAt, "MMMM do, yyyy")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions index={row.index} data={row.original} />,
  },
];
