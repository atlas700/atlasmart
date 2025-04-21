import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const OrderStatusSchema = z.object({
  status: z.enum([
    OrderStatus.READYFORSHIPPING,
    OrderStatus.SHIPPED,
    OrderStatus.OUTFORDELIVERY,
    OrderStatus.DELIVERED,
  ]),
});

export type OrderStatusValidator = z.infer<typeof OrderStatusSchema>;
