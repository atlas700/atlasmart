import { relations } from "drizzle-orm";
import { decimal, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AvailableItemTable } from "./availableItem";
import { CartItemTable } from "./cartItem";
import { ColorTable } from "./color";
import { OrderItemTable } from "./orderItem";
import { ProductTable } from "./product";

export const ProductItemTable = pgTable("product_item", {
  id,
  images: text().array().notNull(),
  discount: decimal({ mode: "number" }).notNull().default(0),

  productId: uuid()
    .notNull()
    .references(() => ProductTable.id, { onDelete: "cascade" }),
  colorIds: text().notNull().array(),

  createdAt,
  updatedAt,
});

export const ProductItemRelationships = relations(
  ProductItemTable,
  ({ many, one }) => ({
    product: one(ProductTable, {
      fields: [ProductItemTable.productId],
      references: [ProductTable.id],
    }),
    orderItems: many(OrderItemTable),
    availableItems: many(AvailableItemTable),
    cartItems: many(CartItemTable),
  })
);
