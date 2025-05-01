"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { OrderCol } from "../../../types";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Truck, ShoppingBag, Container, MailCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderStatuses } from "@/drizzle/schema";
import { escape } from "querystring";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  order: OrderCol;
};

const TrackStick = ({ isActive }: { isActive: boolean }) => {
  return (
    <div
      className={cn("w-0.5 h-16", isActive ? "bg-green-500" : "bg-gray-300")}
    />
  );
};

const TrackMessage = ({
  message,
  isActive,
  Icon,
}: {
  message: string;
  isActive: boolean;
  Icon: any;
}) => {
  return (
    <div
      className={cn(
        "flex items-center p-2 border rounded-lg shadow-sm",
        isActive
          ? "border-green-500 text-green-500 font-medium"
          : "border-gray-300"
      )}
    >
      <Icon className="w-5 h-5 mr-2" />
      {message}
    </div>
  );
};

const TrackOrderModal = ({ isOpen, onClose, order }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let content = (
    <div className="w-full flex justify-center">
      <ScrollArea>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm flex flex-wrap gap-0.5 justify-center px-4">
            {order.orderItems.map((item: any) => (
              <div
                key={item.id}
                className="relative w-12 h-12 rounded-full overflow-hidden"
              >
                <Image
                  className="object-cover"
                  src={item.productItem.images[0]}
                  fill
                  alt="order-image"
                />
              </div>
            ))}
          </div>

          <TrackStick
            isActive={
              order.status === orderStatuses[3] ||
              order.status === orderStatuses[4] ||
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackMessage
            Icon={ShoppingBag}
            message="Ready for Shipping"
            isActive={
              order.status === orderStatuses[3] ||
              order.status === orderStatuses[4] ||
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackStick
            isActive={
              order.status === orderStatuses[4] ||
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackMessage
            Icon={Container}
            message="Shipped"
            isActive={
              order.status === orderStatuses[4] ||
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackStick
            isActive={
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackMessage
            Icon={Truck}
            message="Out For Delivery"
            isActive={
              order.status === orderStatuses[5] ||
              order.status === orderStatuses[6]
            }
          />

          <TrackStick isActive={order.status === orderStatuses[6]} />

          <TrackMessage
            Icon={MailCheck}
            message="Delivered"
            isActive={order.status === orderStatuses[6]}
          />
        </div>
      </ScrollArea>
    </div>
  );

  if (
    order.status === orderStatuses[6] ||
    order.status === orderStatuses[10] ||
    order.status === orderStatuses[8] ||
    order.status === orderStatuses[9] ||
    order.status === orderStatuses[11]
  ) {
    content = (
      <div className="flex flex-col gap-5">
        <p className="text-green-500 font-medium">
          Item(s) has been delivered!
        </p>

        <div className="space-y-4 p-2 border rounded-lg">
          <h2 className="font-bold text-lg">Delivery Address</h2>

          <div className="space-y-1">
            {order.address?.split(",").map((address: any, i: number) => (
              <div key={i} className="text-sm">
                {address ? address : "N/A"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (order.status === orderStatuses[7]) {
    content = (
      <div className="flex flex-col gap-5">
        <p className="text-red-500">Order has been cancelled!</p>

        <div className="space-y-4 p-2 border rounded-lg">
          <h2 className="font-bold text-lg">Delivery Address</h2>

          <div className="space-y-1">
            {order.address?.split(",").map((address: any, i: number) => (
              <div key={i} className="text-sm">
                {address ? address : "N/A"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Order</DialogTitle>

          <DialogDescription>
            Tracking ID:{" "}
            <span className="font-semibold text-black">
              #{order.trackingId}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {content}
      </DialogContent>
    </Dialog>
  );
};

export default TrackOrderModal;
