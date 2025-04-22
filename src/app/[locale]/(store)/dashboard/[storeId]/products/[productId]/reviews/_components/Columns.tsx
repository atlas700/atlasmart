"use client";

import { format } from "date-fns";
import { Review } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { FaStar, FaRegStar } from "react-icons/fa6";

export type ReviewCol = Review;

export const columns: ColumnDef<ReviewCol>[] = [
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => <div>{row.original.reason}</div>,
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => <div>{row.original.comment}</div>,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {new Array(5).fill("").map((_, index) => (
          <span key={index}>
            {row.original.value >= index + 1 ? (
              <FaStar className="w-4 h-4 text-yellow-500" />
            ) : (
              <FaRegStar className="w-4 h-4 text-yellow-500" />
            )}
          </span>
        ))}
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
];
