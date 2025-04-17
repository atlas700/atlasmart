import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { StoreTable } from "./store";
import { boolean, text } from "drizzle-orm/pg-core";

export const BannerTable = pgTable(
  "banner",
  {
    id,
    name: text().notNull(),
    image: text().notNull(),
    active: boolean().notNull().default(true),
    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      storeIdIdx: index("store_id_idx").on(table.storeId),
    };
  }
);

export const BannerRelationships = relations(BannerTable, ({ one }) => ({
  store: one(StoreTable, {
    fields: [BannerTable.storeId],
    references: [StoreTable.id],
  }),
}));
