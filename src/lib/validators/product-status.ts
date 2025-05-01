import { productStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const ProductStatusSchema = z.object({
  status: z.enum([
    productStatuses[2],
    productStatuses[0],
    productStatuses[3],
    productStatuses[1],
    productStatuses[4],
  ]),
  statusFeedback: z.string().min(1, { message: "Feedback is required" }),
});

export type ProductStatusValidator = z.infer<typeof ProductStatusSchema>;
