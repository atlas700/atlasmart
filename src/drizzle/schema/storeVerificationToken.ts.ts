import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";

export const StoreVerificationTokenTable = pgTable("store_verification_token", {
  id,
  email: text().notNull(),
  token: text().unique().notNull(),
  expires: timestamp({ withTimezone: true }).notNull(),

  createdAt,
  updatedAt,
});
