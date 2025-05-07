"use client";

import { format } from "date-fns";
import CellActions from "./CellActions";
import { ColumnDef } from "@tanstack/react-table";
import { SizeTable } from "@/drizzle/schema";

export type SizeCol = typeof SizeTable.$inferSelect;

export const columns: ColumnDef<SizeCol>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value" },
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
