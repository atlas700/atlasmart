import { orderStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const OrderStatusSchema = z.object({
  status: z.enum([
    orderStatuses[3],
    orderStatuses[4],
    orderStatuses[5],
    orderStatuses[6],
  ]),
});

export type OrderStatusValidator = z.infer<typeof OrderStatusSchema>;
