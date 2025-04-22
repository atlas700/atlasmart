import React from "react";
import { storeStatus } from "@prisma/client";
import { cn, getStatusColor } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  status: storeStatus;
  statusFeedback: string;
};

const NotApproved = ({ status, statusFeedback }: Props) => {
  return (
    <Card className="w-full max-w-[300px] sm:max-w-sm shadow-sm">
      <CardHeader>
        <CardTitle>Store Status</CardTitle>

        <CardDescription>Your store is not approved yet.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <p>
          Status:{" "}
          <span className={cn("font-medium", getStatusColor(status))}>
            {status}
          </span>
        </p>

        <p className="text-sm">{statusFeedback}</p>
      </CardContent>
    </Card>
  );
};

export default NotApproved;
