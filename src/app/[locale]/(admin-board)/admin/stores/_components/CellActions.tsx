"use client";

import React, { useState } from "react";
import StatusModal from "./StatusModal";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreTable } from "@/drizzle/schema";

type Props = {
  data: typeof StoreTable.$inferSelect;
};

const CellActions = ({ data }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <StatusModal
        data={data}
        open={open}
        onOpenChange={() => setOpen(false)}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Store</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Update Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
