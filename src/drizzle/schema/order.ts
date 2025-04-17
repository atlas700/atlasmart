import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";
import { OrderItemTable } from "./orderItem";
import { ReturnRequestTable } from "./returnRequest";

export const orderStatuses = [
  "PROCESSING",
  "CONFIRMED",
  "FAILED",
  "READYFORSHIPPING",
  "SHIPPED",
  "OUTFORDELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNREQUESTED",
  "RETURNING",
  "RETURNED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const orderStatusEnum = pgEnum("order_status", orderStatuses);

export const OrderTable = pgTable(
  "order",
  {
    id,

    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    trackingId: text().unique(),
    address: text(),
    paymentIntentId: text().unique(),
    status: orderStatusEnum().notNull().default("PROCESSING"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdIdx: index("order_user_id_index").on(table.userId),
    trackingIdIdx: index("order_tracking_id_index").on(table.trackingId),
  })
);

export const OrderRelationships = relations(OrderTable, ({ many, one }) => ({
  user: one(UserTable, {
    fields: [OrderTable.userId],
    references: [UserTable.id],
  }),
  orderItems: many(OrderItemTable),
  returnRequests: many(ReturnRequestTable),
}));
