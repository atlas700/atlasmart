"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getProductColor } from "@/lib/utils";
import { ProductStatus } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  status: ProductStatus;
  statusFeedback: string;
  onOpenChange: () => void;
};

const Status = ({ open, status, statusFeedback, onOpenChange }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={cn(getProductColor(status))}>
            {status}
          </DialogTitle>

          <DialogDescription className="text-black">
            {statusFeedback}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Status;
