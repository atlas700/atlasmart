import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrderItemTable } from "./orderItem";
import { ReturnRequestTable } from "./returnRequest";
import { StoreTable } from "./store";

export const ReturnItemTable = pgTable(
  "return_item",
  {
    id,
    orderItemId: uuid()
      .notNull()
      .references(() => OrderItemTable.id, { onDelete: "cascade" }),
    returnRequestId: uuid()
      .notNull()
      .unique()
      .references(() => ReturnRequestTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      orderItemIdIdx: index("return_item_order_item_id_idx").on(
        table.orderItemId
      ),
      returnRequestIdIdx: index("return_item_return_request_id_idx").on(
        table.returnRequestId
      ),
    };
  }
);

export const ReturnItemRelationships = relations(
  ReturnItemTable,
  ({ one }) => ({
    orderItem: one(OrderItemTable, {
      fields: [ReturnItemTable.orderItemId],
      references: [OrderItemTable.id],
    }),
    returnRequest: one(StoreTable, {
      fields: [ReturnItemTable.returnRequestId],
      references: [StoreTable.id],
    }),
  })
);
