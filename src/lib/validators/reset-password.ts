import { z } from "zod";

export const ResetSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format." }),
});

export type ResetValidator = z.infer<typeof ResetSchema>;
