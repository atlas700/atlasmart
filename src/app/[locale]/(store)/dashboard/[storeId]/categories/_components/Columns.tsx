"use client";

import { format } from "date-fns";
import { Category } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import CellActions from "./CellActions";

export type CategoryCol = Category & {
  _count: {
    products: number;
  };
};

export const columns: ColumnDef<CategoryCol>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div>{format(row.original.createdAt, "MMMM do, yyyy")}</div>
    ),
  },
  {
    accessorKey: "Products",
    header: "Number of Products",
    cell: ({ row }) => <div>{row.original._count.products}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions index={row.index} data={row.original} />,
  },
];
