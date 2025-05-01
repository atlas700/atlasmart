"use client";

import React from "react";
import { toast } from "sonner";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { formatPrice } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { ReturnRequestProps } from "../../../../../../../types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: () => void;
  orderId: string;
};

const RequestModal = ({ open, onOpenChange, orderId }: Props) => {
  const router = useRouter();

  const {
    data: returnRequest,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-return-request", orderId],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/requests/${orderId}`);

      return res.data as ReturnRequestProps;
    },
  });

  const { mutate: acceptRequest, isPending } = useMutation({
    mutationKey: ["refund-return-request"],
    mutationFn: async () => {
      if (!returnRequest) return;

      await axios.post(
        `/api/admin/requests/${orderId}/accept/${returnRequest.id}`
      );
    },
    onSuccess: () => {
      toast.success("Your return request has been accepted.");

      router.refresh();

      onOpenChange();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const handleClose = () => {
    if (isPending) return;

    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Request</DialogTitle>

          <DialogDescription>#{orderId}</DialogDescription>
        </DialogHeader>

        {isLoading && <Spinner />}

        {!isLoading && isError && (
          <div className="py-4 text-red-500">
            Refund request not found! Try again.
          </div>
        )}

        {!isLoading && !isError && returnRequest && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-lg font-bold">Return Item(s):</h1>

              <ScrollArea>
                <div className="space-y-4">
                  {returnRequest.returnItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                        <Image
                          className="object-cover"
                          src={item.orderitem.productItem.images[0]}
                          fill
                          alt="return-request-item-img"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-1">
                        <span className="font-semibold">
                          {item.orderitem.product.name}
                        </span>

                        <span className="font-semibold text-sm">
                          {item.orderitem.product.category.name}
                        </span>

                        <span className="text-sm text-gray-500">
                          Qty: {item.orderitem.quantity}
                        </span>
                      </div>

                      <p className="font-bold">
                        {formatPrice(
                          item.orderitem.availableItem.currentPrice,
                          {
                            currency: "USD",
                          }
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-bold">Reason:</h1>

              <p className="text-sm">{returnRequest.reason}</p>
            </div>

            <div className="w-full flex items-center gap-3 justify-end">
              <Button
                type="button"
                onClick={() => onOpenChange()}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => acceptRequest()}
                disabled={isPending}
              >
                Refund
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestModal;
