"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import CellActions from "./CellActions";
import { CategoryTable } from "@/drizzle/schema";

export type CategoryCol = typeof CategoryTable.$inferSelect & {
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
