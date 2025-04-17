import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StoreTable } from "./store";

export const ColorTable = pgTable(
  "color",
  {
    id,
    name: text().notNull(),
    value: text().notNull(),

    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      nameIdx: index("color_name_idx").on(table.name),
      storeIdIdx: index("color_store_id_idx").on(table.storeId),
    };
  }
);

export const ColorRelationships = relations(ColorTable, ({ one }) => ({
  store: one(StoreTable, {
    fields: [ColorTable.storeId],
    references: [StoreTable.id],
  }),
}));
