import { z } from "zod";

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(20, { message: "Password must be at most 20 characters long." }),
});

export type NewPasswordValidator = z.infer<typeof NewPasswordSchema>;
