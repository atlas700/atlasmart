import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrderTable } from "./order";
import { StoreTable } from "./store";
import { ProductTable } from "./product";
import { ProductItemTable } from "./productItem";
import { AvailableItemTable } from "./availableItem";
import { ReturnItemTable } from "./returnItem";

export const OrderItemTable = pgTable(
  "order_item",
  {
    id,
    quantity: integer().notNull(),
    readyToBeShipped: boolean().notNull().default(false),

    orderId: uuid()
      .notNull()
      .references(() => OrderTable.id, {
        onDelete: "cascade",
      }),
    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, {
        onDelete: "cascade",
      }),
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
    orderIdIdx: index("order_item_order_id_index").on(table.orderId),
    storeIdIdx: index("order_item_store_id_index").on(table.storeId),
    productIdIdx: index("order_item_product_id_index").on(table.productId),
    productItemIdIdx: index("order_item_product_item_id_index").on(
      table.productItemId
    ),
    availableItemIdIdx: index("order_item_available_item_id_index").on(
      table.availableItemId
    ),
  })
);

export const OrderItemRelationships = relations(
  OrderItemTable,
  ({ many, one }) => ({
    order: one(OrderTable, {
      fields: [OrderItemTable.orderId],
      references: [OrderTable.id],
    }),
    store: one(StoreTable, {
      fields: [OrderItemTable.storeId],
      references: [StoreTable.id],
    }),
    product: one(ProductTable, {
      fields: [OrderItemTable.productId],
      references: [ProductTable.id],
    }),
    productItem: one(ProductItemTable, {
      fields: [OrderItemTable.productItemId],
      references: [ProductItemTable.id],
    }),
    availableItem: one(AvailableItemTable, {
      fields: [OrderItemTable.availableItemId],
      references: [AvailableItemTable.id],
    }),
    returnItems: many(ReturnItemTable),
  })
);
