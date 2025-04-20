"use client";

import Image from "next/image";
import { format } from "date-fns";
import { OrderCol } from "@/types";
import CellActions from "./CellActions";
import { OrderStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { cn, getOrderStatusText } from "@/lib/utils";

export const columns: ColumnDef<OrderCol>[] = [
  {
    accessorKey: "trackingId",
    header: "Tracking ID",
    cell: ({ row }) => (
      <>
        {row.original.trackingId ? (
          <div className="font-bold">#{row.original.trackingId}</div>
        ) : (
          <div className="font-bold">No tracking ID</div>
        )}
      </>
    ),
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => (
      <div className="grid gap-2">
        {row.original.orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full overflow-hidden">
              <Image
                className="object-cover"
                src={item.productItem.images[0]}
                fill
                alt="item-image"
              />
            </div>

            <span className="font-medium">
              {item.product.name} ({item.availableItem.size.name}),
            </span>

            <span className="font-medium">Qty: ({item.quantity})</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "font-bold text-violet-500",
          row.original.status === OrderStatus.CONFIRMED && "text-green-500",
          row.original.status === OrderStatus.CANCELLED && "text-red-500"
        )}
      >
        {getOrderStatusText(row.original.status)}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Ordered By",
    cell: ({ row }) => (
      <div>{format(row.original.createdAt, "MMMM do, yyyy")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
