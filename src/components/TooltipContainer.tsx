import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  children: React.ReactNode;
  message: string;
};

const TooltipContainer = ({ children, message }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button">{children}</TooltipTrigger>

        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipContainer;
