import { z } from "zod";

export const SizeSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  value: z.string().min(1, { message: "Value is required." }),
});

export type SizeValidator = z.infer<typeof SizeSchema>;
