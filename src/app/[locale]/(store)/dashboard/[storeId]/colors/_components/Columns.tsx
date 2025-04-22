"use client";

import { format } from "date-fns";
import { Color } from "@prisma/client";
import CellActions from "./CellActions";
import { ColumnDef } from "@tanstack/react-table";

export type ColorCol = Color;

export const columns: ColumnDef<ColorCol>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          style={{ backgroundColor: row.original.value }}
          className="w-6 h-6 rounded-full border"
        />

        <span>{row.original.value}</span>
      </div>
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
