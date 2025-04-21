import { z } from "zod";

export const ColorSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  value: z.string().min(1, { message: "Value is required." }),
});

export type ColorValidator = z.infer<typeof ColorSchema>;
