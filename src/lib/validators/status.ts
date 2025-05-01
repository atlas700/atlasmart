import { storeStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const StatusSchema = z.object({
  status: z.enum([
    storeStatuses[2],
    storeStatuses[0],
    storeStatuses[3],
    storeStatuses[1],
    storeStatuses[4],
  ]),
  statusFeedback: z.string().min(1, { message: "Feedback is required" }),
});

export type StatusValidator = z.infer<typeof StatusSchema>;
