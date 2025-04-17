import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AvailableItemTable } from "./availableItem";
import { CartItemTable } from "./cartItem";
import { CategoryTable } from "./category";
import { OrderItemTable } from "./orderItem";
import { ProductItemTable } from "./productItem";
import { ReviewTable } from "./review";
import { StoreTable } from "./store";
import { UserTable } from "./user";

export const productStatuses = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "DECLINED",
  "ARCHIVED",
] as const;
export type ProductStatus = (typeof productStatuses)[number];
export const productStatusEnum = pgEnum("product_status", productStatuses);

export const ProductTable = pgTable(
  "product",
  {
    id,
    name: text().notNull(),
    description: text().notNull(),
    status: productStatusEnum().notNull().default("PENDING"),
    statusFeedback: text().default(
      "Your product has been submitted for approval"
    ),

    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    storeId: uuid()
      .notNull()
      .references(() => StoreTable.id, { onDelete: "cascade" }),
    categoryId: uuid()
      .notNull()
      .references(() => CategoryTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => {
    return {
      userIdIdx: index("product_user_id_idx").on(table.userId),
      storeIdIdx: index("product_store_id_idx").on(table.storeId),
      categoryIdIdx: index("product_category_id_idx").on(table.categoryId),
      nameIdx: index("product_name_idx").on(table.name),
      statusIdx: index("product_status_idx").on(table.status),
    };
  }
);

export const ProductRelationships = relations(
  ProductTable,
  ({ many, one }) => ({
    user: one(UserTable, {
      fields: [ProductTable.userId],
      references: [UserTable.id],
    }),
    store: one(StoreTable, {
      fields: [ProductTable.storeId],
      references: [StoreTable.id],
    }),
    category: one(CategoryTable, {
      fields: [ProductTable.categoryId],
      references: [CategoryTable.id],
    }),
    productItems: many(ProductItemTable),
    availableItems: many(AvailableItemTable),
    cartItems: many(CartItemTable),
    reviews: many(ReviewTable),
    orderItems: many(OrderItemTable),
  })
);
