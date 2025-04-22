"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Color } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import AlertModal from "@/components/modal/AlertModal";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  data: Color;
  index: number;
};

const CellActions = ({ data, index }: Props) => {
  const params = useParams();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const { mutate: onDelete, isPending } = useMutation({
    mutationKey: ["delete-color"],
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}/colors/${data?.id}`);
    },
    onSuccess: () => {
      toast.success("Color Deleted!");

      router.push(`/dashboard/${params.storeId}/colors`);

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
        loading={isPending}
        featureToDelete="color"
        testId={`color-${index}-delete`}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild data-cy={`color-${index}-trigger`}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Color</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/${data.storeId}/colors/${data.id}`)
            }
            disabled={isPending}
            data-cy={`color-${index}-update-btn`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Update
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={isPending}
            data-cy={`color-${index}-delete-btn`}
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
