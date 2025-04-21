import { z } from "zod";

export const StoreSettingsSchema = z.object({
  logo: z.optional(z.string()),
  name: z.string().min(1, { message: "Name is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  postcode: z.string().min(1, { message: "Postcode is required." }),
  description: z.optional(z.string()),
});

export type StoreSettingsValidator = z.infer<typeof StoreSettingsSchema>;
