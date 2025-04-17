import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CartItemTable } from "./cartItem";
import { UserTable } from "./user";

export const CartTable = pgTable(
  "cart",
  {
    id,

    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdIdx: index("cart_user_id_index").on(table.userId),
  })
);

export const CartRelationships = relations(CartTable, ({ many, one }) => ({
  user: one(UserTable, {
    fields: [CartTable.userId],
    references: [UserTable.id],
  }),
  cartItems: many(CartItemTable),
}));
