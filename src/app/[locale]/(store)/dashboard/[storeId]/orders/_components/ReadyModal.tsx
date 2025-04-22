"use client";

import React from "react";
import BtnSpinner from "@/components/BtnSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
};

const ReadyModal = ({ open, onClose, onConfirm, isPending }: Props) => {
  const handleClose = () => {
    if (isPending) return;

    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to mark this item as &apos;Ready for
            Shipping&apos;?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Please confirm that the item is packaged and ready to be shipped to
            the buyer. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction onClick={() => onConfirm()} disabled={isPending}>
            {isPending ? <BtnSpinner /> : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReadyModal;
