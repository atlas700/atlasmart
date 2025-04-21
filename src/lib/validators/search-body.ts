import { z } from "zod";

export const SearchBodySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minDiscount: z.string().optional(),
  maxDiscount: z.string().optional(),
});
