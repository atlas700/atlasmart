"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import useStoreModal from "@/hooks/use-store-modal";
import {
  GemIcon,
  ChevronsUpDown,
  StarIcon,
  Check,
  PlusCircleIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { StoreTable } from "@/drizzle/schema";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface Props extends PopoverTriggerProps {
  stores: (typeof StoreTable.$inferSelect)[];
}

const StoreSwitcher = ({ className, stores = [] }: Props) => {
  const params = useParams();

  const router = useRouter();

  const storeModal = useStoreModal();

  const [open, setOpen] = useState(false);

  const formattedStores = stores.map((store) => ({
    label: store.name,
    value: store.id,
  }));

  const currentStore = formattedStores.find(
    (store) => store.value === params.storeId
  );

  const onStoreSelect = (store: { label: string; value: string }) => {
    setOpen(false);

    router.push(`/dashboard/${store.value}`);

    storeModal.onClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        data-testid="store-popover-btn"
        data-cy="store-popover-btn"
      >
        <Button
          className={cn("w-[200px] justify-between", className)}
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
        >
          <GemIcon className="h-4 w-4 mr-2" />

          {currentStore?.label}

          <ChevronsUpDown className="h-4 w-4 ml-auto shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput
              placeholder="Search store..."
              autoComplete="off"
              autoFocus={false}
            />

            <CommandEmpty>No store found.</CommandEmpty>

            <CommandGroup heading="All Stores">
              {formattedStores.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onStoreSelect(store)}
                >
                  <StarIcon className="h-4 w-4 mr-2" />

                  {store.label}

                  <Check
                    className={`h-4 w-4 ml-auto ${
                      currentStore?.value === store.value
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <CommandSeparator />

          <CommandList>
            <CommandGroup>
              <CommandItem
                data-testid="create-store-btn"
                data-cy="create-store-btn"
                onSelect={() => {
                  setOpen(false);

                  storeModal.onOpen();
                }}
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StoreSwitcher;
