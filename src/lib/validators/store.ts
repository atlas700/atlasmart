import { z } from "zod";

export const StoreSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format." }),
  country: z.string().min(1, { message: "Country is required." }),
  postcode: z.string().min(1, { message: "Postcode is required." }),
  code: z.optional(z.string()),
});

export type StoreValidator = z.infer<typeof StoreSchema>;
