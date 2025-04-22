"use client";

import React from "react";
import BtnSpinner from "../BtnSpinner";
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

const CancelOrderModal = ({ open, onClose, onConfirm, isPending }: Props) => {
  const onCloseHandler = () => {
    if (isPending) return;

    onclose;
  };

  return (
    <AlertDialog open={open} onOpenChange={onCloseHandler}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will cancel your current order.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <BtnSpinner /> : "Cancel Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelOrderModal;
