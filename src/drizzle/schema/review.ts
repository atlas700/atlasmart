import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { ProductTable } from "./product";
import { UserTable } from "./user";
import { StoreTable } from "./store";

export const ReviewTable = pgTable(
  "review",
  {
    id,

    value: integer().notNull(),
    reason: text().notNull(),
    comment: text().notNull(),
    helpful: text().array().default([]).notNull(),

    productId: uuid()
      .notNull()
      .references(() => ProductTable.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    productIdIdx: index("review_product_id_index").on(table.productId),
    userIdIdx: index("review_user_id_index").on(table.userId),
    storeIdIdx: index("review_store_id_index").on(table.storeId),
  })
);

export const ReviewRelationships = relations(ReviewTable, ({ one }) => ({
  product: one(ProductTable, {
    fields: [ReviewTable.productId],
    references: [ProductTable.id],
  }),
  user: one(UserTable, {
    fields: [ReviewTable.userId],
    references: [UserTable.id],
  }),
  store: one(StoreTable, {
    fields: [ReviewTable.storeId],
    references: [StoreTable.id],
  }),
}));
