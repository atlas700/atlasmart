import { relations } from "drizzle-orm";
import { integer, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AvailableItemTable } from "./availableItem";
import { CartTable } from "./cart";
import { ProductTable } from "./product";
import { ProductItemTable } from "./productItem";

export const CartItemTable = pgTable(
  "cart_item",
  {
    id,
    quantity: integer().notNull().default(1),

    cartId: uuid()
      .notNull()
      .references(() => CartTable.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => ProductTable.id, {
        onDelete: "cascade",
      }),
    productItemId: uuid()
      .notNull()
      .references(() => ProductItemTable.id, {
        onDelete: "cascade",
      }),
    availableItemId: uuid()
      .notNull()
      .references(() => AvailableItemTable.id, {
        onDelete: "cascade",
      }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueCartItem: unique("cart_item_unique").on(
      table.availableItemId,
      table.productItemId,
      table.productId,
      table.cartId
    ),
  })
);

export const CartItemRelationships = relations(CartItemTable, ({ one }) => ({
  cart: one(CartTable, {
    fields: [CartItemTable.cartId],
    references: [CartTable.id],
  }),
  product: one(ProductTable, {
    fields: [CartItemTable.productId],
    references: [ProductTable.id],
  }),
  productItem: one(ProductItemTable, {
    fields: [CartItemTable.productItemId],
    references: [ProductItemTable.id],
  }),
  availableItem: one(AvailableItemTable, {
    fields: [CartItemTable.availableItemId],
    references: [AvailableItemTable.id],
  }),
}));
