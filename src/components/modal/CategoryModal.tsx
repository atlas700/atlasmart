"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
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

const CategoryModal = ({ children }: Props) => {
  const params = useParams();

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [value, setValue] = useState("");

  const [mounted, setMounted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-category-modal"],
    mutationFn: async (values: { name: string }) => {
      await axios.post(`/api/stores/${params.storeId}/categories/new`, values);
    },
    onSuccess: () => {
      toast.success("Category Created!");

      queryClient.invalidateQueries({
        queryKey: ["product-category"],
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
    if (value.trim() === "") return;

    mutate({ name: value });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen} data-testid="category-form">
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>

          <DialogDescription>Add a category to your store.</DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-6">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            placeholder="Shoes..."
          />

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

export default CategoryModal;
