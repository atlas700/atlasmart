import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CartItemTable,
  CartTable,
  OrderItemTable,
  orderStatuses,
  OrderTable,
  ProductTable,
  StoreTable,
  UserTable,
} from "@/drizzle/schema";
import { generateTrackingId } from "@/lib/functions";
import {
  sendConfirmationOrderEmail,
  sendStoreConfirmationEmail,
} from "@/lib/mail";
import { stripe } from "@/lib/stripe";
import { formatPrice, SHIPPING_FEE, TRANSACTION_FEE } from "@/lib/utils";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    const stripeSignature = (await headers()).get("stripe-signature");

    event = stripe.webhooks.constructEvent(
      await req.text(),
      stripeSignature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return new Response(
      JSON.stringify({ message: `Webhook Error: ${errorMessage}` }),
      { status: 400 }
    );
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id);

  const session = event.data.object as Stripe.Checkout.Session;

  const paymentIntentId = session.payment_intent as string;

  if (!paymentIntentId) {
    return new Response("Payment Intent ID is required", { status: 400 });
  }

  const userId = session?.metadata?.userId;

  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
    columns: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const orderId = session?.metadata?.orderId;

  if (!orderId) {
    return new Response("Order ID is required", { status: 400 });
  }

  const orderExists = await db.query.OrderTable.findFirst({
    where: eq(OrderTable.id, orderId),
    columns: {
      id: true,
    },
  });

  if (!orderExists) {
    return new Response("Order not found", { status: 404 });
  }

  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  if (event.type === "checkout.session.completed") {
    const cart = await db.query.CartTable.findFirst({
      where: eq(CartTable.userId, userId),
    });

    //Delete every item from users cart
    await db.delete(CartItemTable).where(eq(CartItemTable.cartId, cart!.id));

    //Generate Tracking ID and checking for uniqueness.
    let trackingId;

    let isUnique = false;

    while (!isUnique) {
      trackingId = generateTrackingId(10);

      const itExists = await db.query.OrderTable.findFirst({
        where: eq(OrderTable.trackingId, trackingId),
        columns: {
          id: true,
        },
      });

      isUnique = itExists === undefined;
    }

    //Update order address and status
    // First, update the order
    const [updatedOrder] = await db
      .update(OrderTable)
      .set({
        address: addressString,
        status: orderStatuses[1],
        trackingId: trackingId,
        paymentIntentId: paymentIntentId,
      })
      .where(eq(OrderTable.id, orderId))
      .returning({
        id: OrderTable.id,
        address: OrderTable.address,
        status: OrderTable.status,
        trackingId: OrderTable.trackingId,
        paymentIntentId: OrderTable.paymentIntentId,
        createdAt: OrderTable.createdAt,
      });

    // Then, fetch the related orderItems
    const orderItems = await db
      .select({
        quantity: OrderItemTable.quantity,
        product: {
          id: ProductTable.id,
          name: ProductTable.name,
        },
        store: {
          email: StoreTable.email,
          name: StoreTable.name,
        },
        availableItemId: OrderItemTable.availableItemId,
        availableItem: {
          currentPrice: AvailableItemTable.currentPrice,
        },
      })
      .from(OrderItemTable)
      .leftJoin(ProductTable, eq(OrderItemTable.productId, ProductTable.id))
      .leftJoin(StoreTable, eq(OrderItemTable.storeId, StoreTable.id))
      .leftJoin(
        AvailableItemTable,
        eq(OrderItemTable.availableItemId, AvailableItemTable.id)
      )
      .where(eq(OrderItemTable.orderId, updatedOrder!.id));

    // Combine the results
    const order = {
      ...updatedOrder,
      orderItems,
    };

    //Send confirmation email to user and store
    try {
      const totalAmount =
        order?.orderItems?.reduce(
          (total, item) =>
            total + item.availableItem!.currentPrice * item?.quantity,
          0
        ) +
        TRANSACTION_FEE +
        SHIPPING_FEE;

      await sendConfirmationOrderEmail({
        email: user.email || "",
        username: user.name || "",
        address: addressString,
        totalAmount: `${formatPrice(totalAmount, { currency: "USD" })}`,
      });

      await Promise.all(
        order.orderItems.map(async (item) => {
          await sendStoreConfirmationEmail({
            email: item!.store!.email || "",
            storeName: item!.store!.name || "",
            customerName: user.name || "",
            orderDate: `${format(order.createdAt!, "MMMM do, yyyy")}`,
            items: `${item.product!.name} (Qty: ${
              item.quantity
            }), price: ${formatPrice(item.availableItem!.currentPrice, {
              currency: "USD",
            })}`,
          });
        })
      );
    } catch (err) {
      console.error("Error sending confirmation email to user:", err);
    }

    //Update number of product in stocks for each order item.
    await Promise.all(
      order.orderItems.map(async (orderItem) => {
        const currentAvailableItem =
          await db.query.AvailableItemTable.findFirst({
            where: eq(AvailableItemTable.id, orderItem.availableItemId),
            columns: { numInStocks: true },
          });

        await db
          .update(AvailableItemTable)
          .set({
            numInStocks: currentAvailableItem!.numInStocks - orderItem.quantity,
          })
          .where(eq(AvailableItemTable.id, orderItem.availableItemId));
      })
    );
  }

  return new Response(null, { status: 200 });
}
