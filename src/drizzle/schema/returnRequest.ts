import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrderTable } from "./order";
import { ReturnItemTable } from "./returnItem";

const requestStatuses = ["REVIEWING", "APPROVED", "DECLINED"] as const;
export type RequestStatus = (typeof requestStatuses)[number];
export const requestStatusesEnum = pgEnum("request_statuses", requestStatuses);

export const ReturnRequestTable = pgTable(
  "return_request",
  {
    id,
    reason: text().notNull(),
    status: requestStatusesEnum().notNull().default("REVIEWING"),
    orderId: uuid()
      .notNull()
      .references(() => OrderTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      orderIdIdx: index("return_request_order_id_idx").on(table.orderId),
    };
  }
);

export const ReturnRequestRelationships = relations(
  ReturnRequestTable,
  ({ one, many }) => ({
    returnItems: many(ReturnItemTable),
    order: one(OrderTable, {
      fields: [ReturnRequestTable.orderId],
      references: [OrderTable.id],
    }),
  })
);
