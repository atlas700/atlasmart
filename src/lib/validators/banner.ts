import { z } from "zod";

export const BannerSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().min(1, { message: "Image is required." }),
});

export type BannerValidator = z.infer<typeof BannerSchema>;
