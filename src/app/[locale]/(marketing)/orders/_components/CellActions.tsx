"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { OrderCol } from "@/types";
import ReturnOrder from "./ReturnOrder";
import { canCancel } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { MoreVertical, Eye, Ban, Undo2 } from "lucide-react";
import TrackOrderModal from "@/components/modal/TrackOrderModal";
import CancelOrderModal from "@/components/modal/CancelOrderModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  data: OrderCol;
};

const CellActions = ({ data }: Props) => {
  const router = useRouter();

  const [trackOrder, setTrackOrder] = useState(false);

  const [cancelOrder, setCancelOrder] = useState(false);

  const [returnOrder, setReturnOrder] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["cancel-order", data.id],
    mutationFn: async () => {
      await axios.patch(`/api/orders/${data.id}`);
    },
    onSuccess: () => {
      toast.success("Order has been cancelled and refunded.");

      router.refresh();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <>
      <TrackOrderModal
        order={data}
        isOpen={trackOrder}
        onClose={() => setTrackOrder(false)}
      />

      {canCancel(data.status) && (
        <CancelOrderModal
          open={cancelOrder}
          onClose={() => setCancelOrder(false)}
          onConfirm={() => mutate()}
          isPending={isPending}
        />
      )}

      {data.status === OrderStatus.DELIVERED && (
        <ReturnOrder
          open={returnOrder}
          onOpenChange={() => setReturnOrder(false)}
          order={data}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Order</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTrackOrder(true)}
            disabled={isPending}
          >
            <Eye className="w-4 h-4 mr-2" />
            Track Order
          </DropdownMenuItem>

          {canCancel(data.status) && (
            <DropdownMenuItem
              onClick={() => setCancelOrder(true)}
              disabled={isPending}
            >
              <Ban className="w-4 h-4 mr-2" />
              Cancel Order
            </DropdownMenuItem>
          )}

          {data.status === OrderStatus.DELIVERED && (
            <DropdownMenuItem
              onClick={() => setReturnOrder(true)}
              disabled={isPending}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Return Item(s)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
