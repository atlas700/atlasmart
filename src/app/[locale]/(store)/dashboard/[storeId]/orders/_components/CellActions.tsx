"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MoreVertical, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ReadyModal from "./ReadyModal";
import { StoreOrderCol } from "../../../../../../../../types";
import { orderStatuses } from "@/drizzle/schema";

type Props = {
  data: StoreOrderCol;
};

const CellActions = ({ data }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [ready, setReady] = useState(false);

  const { mutate: readyForShipping, isPending } = useMutation({
    mutationKey: ["get-item-ready-for-shipping", data.id],
    mutationFn: async () => {
      await axios.patch(`/api/stores/${params.storeId}/orderItems/${data.id}`);
    },
    onSuccess: () => {
      toast.success("Item is now ready to be shipped.");

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

  if (data.order.status !== orderStatuses[1] || data.readyToBeShipped) {
    return null;
  }

  return (
    <>
      <ReadyModal
        open={ready}
        onClose={() => setReady(false)}
        onConfirm={() => readyForShipping()}
        isPending={isPending}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Product</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setReady(true)} disabled={isPending}>
            <Truck className="w-4 h-4 mr-2" />
            Ready for Shipping
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
