import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const BtnSpinner = ({ className }: Props) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div
        className={cn(
          "w-5 h-5 rounded-full border-t border-l animate-spin",
          className
        )}
      />
    </div>
  );
};

export default BtnSpinner;
