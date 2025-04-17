import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StoreTable } from "./store";
import { ProductTable } from "./product";

export const CategoryTable = pgTable(
  "categories",
  {
    id,
    name: text().notNull(),
    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => ({
    nameIdx: index("category_name_idx").on(table.name),
    storeIdIdx: index("category_store_id_idx").on(table.storeId),
  })
);

export const CategoryRelationships = relations(
  CategoryTable,
  ({ one, many }) => ({
    store: one(StoreTable, {
      fields: [CategoryTable.storeId],
      references: [StoreTable.id],
    }),
    products: many(ProductTable),
  })
);
