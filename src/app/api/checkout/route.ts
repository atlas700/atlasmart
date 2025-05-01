import { db } from "@/drizzle/db";
import {
  CartItemTable,
  CartTable,
  OrderItemTable,
  OrderTable,
  userRoles,
} from "@/drizzle/schema";
import { stripe } from "@/lib/stripe";
import { CartItemsSchema } from "@/lib/validators/cart-item";
import { getCurrentUser } from "@/services/clerk";
import { and, desc, eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("User must be logged in to perform this action.", {
        status: 401,
      });
    }

    //Check if current role is USER
    if (user.role !== userRoles[0]) {
      return new Response("You do not have permission to use stripe.", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = CartItemsSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { cartId } = validatedBody;

    //Check if user has a cart
    const cart = await db.query.CartTable.findFirst({
      where: and(eq(CartTable.id, cartId), eq(CartTable.userId, user.id)),
      columns: {
        id: true,
        userId: true,
      },
    });

    if (!cart) {
      return new Response("Your cart is empty! Try adding to cart.", {
        status: 400,
      });
    }

    const cartItems = await db.query.CartItemTable.findMany({
      where: eq(CartItemTable.cartId, cart.id),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            storeId: true,
          },
          with: {
            category: {
              columns: {
                name: true,
              },
            },
          },
        },
        productItem: {
          columns: {
            id: true,
            images: true,
          },
        },
        availableItem: {
          columns: {
            id: true,
            currentPrice: true,
            numInStocks: true,
          },
        },
      },
      orderBy: desc(CartItemTable.createdAt),
    });

    if (cartItems.length === 0) {
      return new Response("Your cart is empty! Try adding to cart.", {
        status: 400,
      });
    }

    const [order] = await db
      .insert(OrderTable)
      .values({
        userId: user.id,
      })
      .returning();

    await Promise.all(
      cartItems.map(async (item) => {
        await db.insert(OrderItemTable).values({
          orderId: order.id,
          storeId: item.product.storeId,
          productId: item?.product.id,
          productItemId: item?.productItem.id,
          availableItemId: item?.availableItem.id,
          quantity: item?.quantity,
        });
      })
    );

    const session = await stripe.checkout.sessions.create({
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "USD",
          unit_amount: Math.round(item.availableItem.currentPrice * 100),
          product_data: {
            name: item?.product.name,
            description: item.product.category.name,
            images: item.productItem.images,
          },
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      customer_email: user?.email || "",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        userId: user.id,
        orderId: order.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }));
  } catch (err) {
    console.log("[CHECKOUT_SESSION_ERROR]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
