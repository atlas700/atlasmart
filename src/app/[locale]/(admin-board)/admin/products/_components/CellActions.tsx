"use client";

import React, { useState } from "react";
import StatusModal from "./StatusModal";
import { Product } from "@prisma/client";
import ViewProduct from "./ViewProduct";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Eye } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  data: Product;
};

const CellActions = ({ data }: Props) => {
  const [open, setOpen] = useState(false);

  const [view, setView] = useState(false);

  return (
    <>
      <StatusModal
        data={data}
        open={open}
        onOpenChange={() => setOpen(false)}
      />

      <ViewProduct
        isOpen={view}
        onClose={() => setView(false)}
        productId={data.id}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Product</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Update Status
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setView(true)}>
            <Eye className="w-4 h-4 mr-2" />
            View Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
