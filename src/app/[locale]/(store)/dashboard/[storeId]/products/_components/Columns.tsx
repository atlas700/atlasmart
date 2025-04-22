"use client";

import { format } from "date-fns";
import CellActions from "./CellActions";
import { Product } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { cn, getProductColor } from "@/lib/utils";

export type ProductCol = Product & {
  category: {
    name: string;
  };
  _count: {
    productItems: number;
  };
};

export const columns: ColumnDef<ProductCol>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.original.category.name}</div>,
  },
  {
    accessorKey: "productItems",
    header: "Product Items",
    cell: ({ row }) => <div>{row.original._count.productItems}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div>{format(row.original.createdAt, "MMMM do, yyyy")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={cn("font-bold", getProductColor(row.original.status))}>
        {row.original.status}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions index={row.index} data={row.original} />,
  },
];
