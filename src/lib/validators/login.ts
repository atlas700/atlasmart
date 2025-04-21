import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format." }),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string()),
});

export type LoginValidator = z.infer<typeof LoginSchema>;
