import { z } from "zod";
import { ProductStatus } from "@prisma/client";

export const ProductStatusSchema = z.object({
  status: z.enum([
    ProductStatus.APPROVED,
    ProductStatus.PENDING,
    ProductStatus.DECLINED,
    ProductStatus.REVIEWING,
    ProductStatus.ARCHIVED,
  ]),
  statusFeedback: z.string().min(1, { message: "Feedback is required" }),
});

export type ProductStatusValidator = z.infer<typeof ProductStatusSchema>;
