import { z } from "zod";

export const ReturnSchema = z.object({
  reason: z.string().min(1, { message: "Your reason is required." }),
  orderItemIds: z
    .array(z.string().min(1))
    .min(1, { message: "At least one order item is required." }),
});

export type ReturnValidator = z.infer<typeof ReturnSchema>;
