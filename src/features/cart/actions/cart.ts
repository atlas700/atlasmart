"use server";

import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CartItemTable,
  CartTable,
  UserTable,
} from "@/drizzle/schema";
import { CartItemSchema, CartItemValidator } from "@/lib/validators/cart-item";
import { getCurrentUser } from "@/services/clerk";
import { and, eq, sql } from "drizzle-orm";

export const addToCartHandler = async (values: CartItemValidator) => {
  try {
    const { user } = await getCurrentUser({ allData: true });

    if (!user || !user.id) {
      throw new Error("Unauthorized, You need to be logged in.");
    }

    if (user.role !== "USER") {
      throw new Error("Unauthorized, Only users can add to cart");
    }

    const { productId, productItemId, availableItemId } = values;

    // 1. Check if available item exists
    const availableItems = await db
      .select({ id: AvailableItemTable.id })
      .from(AvailableItemTable)
      .where(
        and(
          eq(AvailableItemTable.id, availableItemId),
          eq(AvailableItemTable.productId, productId),
          eq(AvailableItemTable.productItemId, productItemId)
        )
      )
      .execute();

    if (availableItems.length === 0) {
      throw new Error("Available item with provided ID does not exist.");
    }

    // 2. Find or create cart
    let cartRecords = await db
      .select()
      .from(CartTable)
      .where(eq(CartTable.userId, user.id))
      .execute();

    if (cartRecords.length === 0) {
      await db.insert(CartTable).values({ userId: user.id }).execute();
      cartRecords = await db
        .select()
        .from(CartTable)
        .where(eq(CartTable.userId, user.id))
        .execute();
    }

    const cartId = cartRecords[0].id;

    // 3. Check if cart item exists
    const cartItems = await db
      .select({
        quantity: CartItemTable.quantity,
        availableNumInStocks: AvailableItemTable.numInStocks,
      })
      .from(CartItemTable)
      .leftJoin(
        AvailableItemTable,
        eq(CartItemTable.availableItemId, AvailableItemTable.id)
      )
      .where(
        and(
          eq(CartItemTable.cartId, cartId),
          eq(CartItemTable.productId, productId),
          eq(CartItemTable.productItemId, productItemId),
          eq(CartItemTable.availableItemId, availableItemId)
        )
      )
      .execute();

    const existingCartItem = cartItems[0];

    // 4. Check stock availability
    if (
      existingCartItem &&
      existingCartItem.quantity >= existingCartItem.availableNumInStocks!
    ) {
      throw new Error(
        `Only ${existingCartItem.availableNumInStocks} of this item is in stocks!`
      );
    }

    // 5. Add or update cart item
    if (existingCartItem) {
      // Update quantity
      await db
        .update(CartItemTable)
        .set({ quantity: sql`quantity + 1` })
        .where(
          and(
            eq(CartItemTable.cartId, cartId),
            eq(CartItemTable.productId, productId),
            eq(CartItemTable.productItemId, productItemId),
            eq(CartItemTable.availableItemId, availableItemId)
          )
        )
        .execute();
    } else {
      // Insert new cart item
      await db
        .insert(CartItemTable)
        .values({
          cartId,
          productId,
          productItemId,
          availableItemId,
          quantity: 1,
        })
        .execute();
    }

    return { message: "Item added to cart!" };
  } catch (err) {
    console.error("[ADD_TO_CART]", err);
    throw new Error("Internal server error");
  }
};

export const updateCartItem = async ({
  cartItemId,
  task,
}: {
  cartItemId: string;
  task: "add" | "minus";
}) => {
  try {
    if (!cartItemId) return;

    const { user } = await getCurrentUser({ allData: true });

    if (!user || !user.id) {
      throw new Error("Unauthorized, You need to be logged in.");
    }

    //Check if cart item exists
    const cartItem = await db.query.CartItemTable.findFirst({
      where: and(
        eq(CartItemTable.id, cartItemId),
        and(eq(UserTable.id, user.id), eq(UserTable.role, "USER"))
      ),
      columns: {
        quantity: true,
      },
      with: {
        availableItem: {
          columns: {
            numInStocks: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found!");
    }

    if (task === "add") {
      //Check if there is an item in stocks.
      if (cartItem.quantity >= cartItem.availableItem.numInStocks) {
        throw new Error(
          `Only ${cartItem.availableItem.numInStocks} of this item is in stocks!`
        );
      }

      //If there is allow customer to increase quality
      await db
        .update(CartItemTable)
        .set({
          quantity: sql`${CartItemTable.quantity} + 1`,
        })
        .where(eq(CartItemTable.id, cartItemId));
    } else {
      //If quality is more than 1 then decrease by 1
      if (cartItem.quantity > 1) {
        await db
          .update(CartItemTable)
          .set({
            quantity: sql`${CartItemTable.quantity} - 1`,
          })
          .where(eq(CartItemTable.id, cartItemId));
      } else {
        //delete cart item.
        await db.delete(CartItemTable).where(eq(CartItemTable.id, cartItemId));
      }
    }

    return { message: "Cart item updated!" };
  } catch (err) {
    console.log("[CART_ITEM_PATCH]", err);

    throw new Error("Internal server error");
  }
};

export const deleteCartItem = async (cartItemId: string) => {
  try {
    if (!cartItemId) {
      return;
    }

    const { user } = await getCurrentUser({ allData: true });

    if (!user || !user.id) {
      throw new Error("Unauthorized, You need to be logged in.");
    }

    //Check if cart item exists
    const cartItem = await db.query.CartItemTable.findFirst({
      where: and(
        eq(CartItemTable.id, cartItemId),
        and(eq(UserTable.id, user.id), eq(UserTable.role, "USER"))
      ),
      columns: {
        id: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found!");
    }

    //Delete cart item
    await db.delete(CartItemTable).where(eq(CartItemTable.id, cartItemId));

    return { message: "Cart item deleted!" };
  } catch (err) {
    console.log("[CART_ITEM_DELETE]", err);

    throw new Error("Internal server error");
  }
};
