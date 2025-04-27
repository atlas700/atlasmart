"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Banner } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/components/modal/AlertModal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { MoreVertical, Edit, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  data: Banner;
  index: number;
};

const CellActions = ({ data, index }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [openActive, setOpenActive] = useState(false);

  const { mutate: onDelete, isPending } = useMutation({
    mutationKey: ["delete-banner"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/banners/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Banner Deleted!");

      router.push(`/dashboard/${params.storeId}/banners`);

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

  const { mutate: onActive, isPending: loading } = useMutation({
    mutationKey: ["set-banner-active", data.id],
    mutationFn: async () => {
      await axios.patch(
        `/api/stores/${params.storeId}/banners/${data?.id}/active`
      );
    },
    onSuccess: () => {
      toast.success("Banner has been set to active!");

      router.push(`/dashboard/${params.storeId}/banners`);

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
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending || loading}
        featureToDelete="banner"
        testId={`banner-${index}-delete`}
      />

      <ConfirmModal
        isOpen={openActive}
        onClose={() => setOpenActive(false)}
        onConfirm={onActive}
        loading={isPending || loading}
        testId={`banner-${index}-active`}
        description="You're about to set a new banner for your store. This will replace your current active banner. Don't worry, you can revert to any of your previous banners at any time if you change your mind."
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild data-cy={`banner-${index}-trigger`}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Banner</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpenActive(true)}
            disabled={isPending || loading}
            data-cy={`banner-${index}-active-btn`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Set to active
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/${data.storeId}/banners/${data.id}`)
            }
            disabled={isPending || loading}
            data-cy={`banner-${index}-update-btn`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Update
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={isPending || loading}
            data-cy={`banner-${index}-delete-btn`}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
