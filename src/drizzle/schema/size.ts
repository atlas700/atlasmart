import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StoreTable } from "./store";
import { AvailableItemTable } from "./availableItem";

export const SizeTable = pgTable(
  "sizes",
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
  (table) => ({
    storeIdIdx: index("size_store_id_index").on(table.storeId),
    nameIdx: index("size_name_index").on(table.name),
  })
);

export const SizeRelationships = relations(SizeTable, ({ many, one }) => ({
  store: one(StoreTable, {
    fields: [SizeTable.storeId],
    references: [StoreTable.id],
  }),
  availableItems: many(AvailableItemTable),
}));
