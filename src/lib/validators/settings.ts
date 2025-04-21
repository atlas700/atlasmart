import { z } from "zod";

export const SettingsSchema = z
  .object({
    image: z.optional(z.string()),
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string().min(6).max(20)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );

export type SettingsValidator = z.infer<typeof SettingsSchema>;
