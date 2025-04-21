import { z } from "zod";
import { storeStatus } from "@prisma/client";

export const StatusSchema = z.object({
  status: z.enum([
    storeStatus.APPROVED,
    storeStatus.PENDING,
    storeStatus.DECLINED,
    storeStatus.REVIEWING,
    storeStatus.CLOSED,
  ]),
  statusFeedback: z.string().min(1, { message: "Feedback is required" }),
});

export type StatusValidator = z.infer<typeof StatusSchema>;
