"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ViewVideo = () => {
  return (
    <Dialog>
      <DialogTrigger className="text-xs sm:text-sm text-violet-500 font-semibold hover:underline">
        Watch Tutorial?
      </DialogTrigger>

      <DialogContent className="px-0 pb-0 overflow-hidden w-full max-w-2xl">
        <DialogHeader className="p-5">
          <DialogTitle>Watch How to Add Products</DialogTitle>

          <DialogDescription>
            This is a tutorial of how to add products in your store.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black w-full aspect-video">
          <video className="w-full h-full" src="/new-tutorial.mp4" controls />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewVideo;
