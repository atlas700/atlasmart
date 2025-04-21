import { z } from "zod";

const AvailableItemSchema = z.object({
  id: z.string(),
  numInStocks: z.coerce.number(),
  sizeId: z.string().min(1, { message: "Size is required." }),
  price: z.coerce.number().min(1, { message: "Price is required." }),
});

const ProductItemSchema = z.object({
  id: z.string(),
  colorIds: z.array(z.string()),
  discount: z.optional(z.coerce.number()),
  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required." }),
  availableItems: z
    .array(AvailableItemSchema)
    .min(1, { message: "At least one available item is required." }),
});

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  productItems: z
    .array(ProductItemSchema)
    .min(1, { message: "At least one product item is required." }),
});

export type ProductValidator = z.infer<typeof ProductSchema>;
