import { relations } from "drizzle-orm";
import { decimal, index, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CartItemTable } from "./cartItem";
import { OrderItemTable } from "./orderItem";
import { ProductTable } from "./product";
import { ProductItemTable } from "./productItem";
import { SizeTable } from "./size";

export const AvailableItemTable = pgTable(
  "available_item",
  {
    id,
    numInStock: integer().notNull(),
    currentPrice: decimal().notNull(),
    originalPrice: decimal().notNull(),

    sizeId: uuid()
      .notNull()
      .references(() => SizeTable.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => ProductTable.id, { onDelete: "cascade" }),
    productItemId: uuid()
      .notNull()
      .references(() => ProductItemTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      sizeIdIdx: index("size_id_idx").on(table.sizeId),
      productIdIdx: index("product_id_idx").on(table.productId),
      productItemIdIdx: index("product_item_id_idx").on(table.productItemId),
    };
  }
);

export const AvailableItemRelationships = relations(
  AvailableItemTable,
  ({ many, one }) => ({
    product: one(ProductTable, {
      fields: [AvailableItemTable.productId],
      references: [ProductTable.id],
    }),
    productItem: one(ProductItemTable, {
      fields: [AvailableItemTable.productItemId],
      references: [ProductItemTable.id],
    }),
    size: one(SizeTable, {
      fields: [AvailableItemTable.sizeId],
      references: [SizeTable.id],
    }),
    orderItems: many(OrderItemTable),
    cartITems: many(CartItemTable),
  })
);
