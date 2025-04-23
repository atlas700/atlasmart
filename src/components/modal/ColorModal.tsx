"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { SketchPicker } from "react-color";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  children: React.ReactNode;
};

const ColorModal = ({ children }: Props) => {
  const params = useParams();

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [value, setValue] = useState("");

  const [mounted, setMounted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-color-modal"],
    mutationFn: async (values: { name: string; value: string }) => {
      await axios.post(`/api/stores/${params.storeId}/colors/new`, values);
    },
    onSuccess: () => {
      toast.success("Color Created!");

      queryClient.invalidateQueries({
        queryKey: ["product-colors"],
      });

      setOpen(false);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = () => {
    if (value.trim() === "" || name.trim() === "") return;

    mutate({ name, value });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen} data-testid="color-form">
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Color</DialogTitle>

          <DialogDescription>Add a color to your store.</DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-6">
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="Name"
            />

            <SketchPicker
              color={value}
              onChange={(color) => !isPending && setValue(color.hex)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onSubmit} type="button" disabled={isPending}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorModal;
