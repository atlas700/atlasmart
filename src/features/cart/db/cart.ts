"use server";

import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CartItemTable,
  CartTable,
  ProductItemTable,
  ProductTable,
  SizeTable,
} from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { desc, eq } from "drizzle-orm";

export const getCartItems = async () => {
  try {
    const { user } = await getCurrentUser({ allData: true });
    if (!user || !user.id) return null;

    const role = user.role;
    if (role !== "USER") return null;

    const carts = await db
      .select()
      .from(CartTable)
      .where(eq(CartTable.userId, user.id))
      .execute();

    if (carts.length === 0) return null;

    const userCart = carts[0];

    const cartItems = await db
      .select()
      .from(CartItemTable)
      .where(eq(CartItemTable.cartId, userCart.id))
      .orderBy(desc(CartItemTable.createdAt))
      .execute();

    if (cartItems.length === 0) return [];

    const detailedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Fetch product
        const products = await db
          .select()
          .from(ProductTable)
          .where(eq(ProductTable.id, item.productId))
          .execute();
        const productData = products[0];

        // Fetch product item
        const productItems = await db
          .select()
          .from(ProductItemTable)
          .where(eq(ProductItemTable.id, item.productItemId))
          .execute();

        const productItemData = productItems[0];

        // Fetch available item
        const availableItems = await db
          .select()
          .from(AvailableItemTable)
          .where(eq(AvailableItemTable.id, item.availableItemId))
          .execute();

        const availableItemData = availableItems[0];

        // Fetch size
        const sizes = await db
          .select()
          .from(SizeTable)
          .where(eq(SizeTable.id, availableItemData.sizeId))
          .execute();
        const sizeData = sizes[0];

        return {
          ...item,
          product: productData,
          productItem: productItemData,
          availableItem: {
            ...availableItemData,
            size: sizeData,
          },
        };
      })
    );

    return {
      ...userCart,
      cartItems: detailedItems,
    };
  } catch (err) {
    return null;
  }
};
