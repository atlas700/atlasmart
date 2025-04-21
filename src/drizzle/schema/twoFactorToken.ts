import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CartTable } from "./cart";
import { OrderTable } from "./order";
import { ProductTable } from "./product";
import { ReviewTable } from "./review";
import { StoreTable } from "./store";

export const userRoles = ["USER", "ADMIN", "SELLER"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_role", userRoles);

export const UserTable = pgTable("users", {
  id,
  clerkUserId: text().notNull().unique(),
  email: text().notNull(),
  name: text().notNull(),
  role: userRoleEnum().notNull().default("USER"),
  imageUrl: text(),
  createdAt,
  updatedAt,
});

export const UserRelationships = relations(UserTable, ({ many }) => ({
  stores: many(StoreTable),
  reviews: many(ReviewTable),
  products: many(ProductTable),
  orders: many(OrderTable),
  cart: many(CartTable),
}));
