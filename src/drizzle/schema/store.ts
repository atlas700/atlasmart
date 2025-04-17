import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { BannerTable } from "./banner";
import { CategoryTable } from "./category";
import { ColorTable } from "./color";
import { OrderItemTable } from "./orderItem";
import { ProductTable } from "./product";
import { ReviewTable } from "./review";
import { SizeTable } from "./size";
import { UserTable } from "./user";

export const storeStatuses = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "DECLINED",
  "CLOSED",
] as const;
export type StoreStatus = (typeof storeStatuses)[number];
export const storeStatusEnum = pgEnum("store_status", storeStatuses);

export const StoreTable = pgTable(
  "stores",
  {
    id,
    name: text().notNull(),
    description: text(),
    email: text().notNull(),
    country: text().notNull(),
    postCode: text().notNull(),
    logo: text(),
    status: storeStatusEnum().notNull().default("APPROVED"),
    statusFeedback: text().default(
      "Your store has been approved. You can now create and manage products."
    ),
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      userIdIdx: index("store_user_id_idx").on(table.userId),
      userIdEmailUnique: unique("store_email_unique").on(
        table.email,
        table.userId
      ),
    };
  }
);

export const StoreRelationships = relations(StoreTable, ({ many, one }) => ({
  user: one(UserTable, {
    fields: [StoreTable.userId],
    references: [UserTable.id],
  }),
  products: many(ProductTable),
  sizes: many(SizeTable),
  category: many(CategoryTable),
  color: many(ColorTable),
  reviews: many(ReviewTable),
  orderItems: many(OrderItemTable),
  banners: many(BannerTable),
}));
