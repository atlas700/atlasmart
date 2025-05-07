import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  storeStatuses,
  StoreTable,
  userRoles,
} from "@/drizzle/schema";
import { sendCreatedProductEmail } from "@/lib/mail";
import { apiRatelimit } from "@/lib/redis";
import { getCurrentPrice } from "@/lib/utils";
import { ProductSchema } from "@/lib/validators/product";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user || !user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== userRoles[2]) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { success } = await apiRatelimit.limit(user.id);

    if (!success && process.env.VERCEL_ENV === "production") {
      return new Response(
        JSON.stringify("Too Many Requests! try again in 1 min"),
        {
          status: 429,
        }
      );
    }

    const { storeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    //Check if store has been approved
    if (store.status !== storeStatuses[2]) {
      return new Response("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ProductSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { name, categoryId, description, productItems } = validatedBody;

    //Check if there is at least one product item
    if (productItems.length < 1) {
      return new Response("At least one product item is required.", {
        status: 400,
      });
    }

    //Create Product
    const [product] = await db
      .insert(ProductTable)
      .values({
        userId: user.id,
        storeId,
        name,
        categoryId,
        description,
      })
      .returning();

    //Create product items
    await Promise.all(
      productItems.map(async (item) => {
        const [productItem] = await db
          .insert(ProductItemTable)
          .values({
            productId: product!.id,
            images: item.images,
            colorIds: item.colorIds || [],
            discount: item.discount,
          })
          .returning();

        await db.insert(AvailableItemTable).values(
          item.availableItems.map((item) => ({
            productId: product!.id,
            productItemId: productItem!.id,
            sizeId: item.sizeId,
            numInStocks: item.numInStocks,
            originalPrice: item.price,
            currentPrice: getCurrentPrice({
              price: item.price,
              discount: productItem!.discount || 0,
            }),
          }))
        );

        const [updatedProduct] = await db
          .update(ProductTable)
          .set({
            status: "APPROVED",
            statusFeedback:
              "Your product has been approved. It will be shown to potential customers.",
          })
          .where(eq(ProductTable.id, product!.id))
          .returning({
            name: ProductTable.name,
            store: {
              name: StoreTable.name,
            },
            category: {
              name: CategoryTable.name,
            },
          });

        //Send email confirmation
        await sendCreatedProductEmail({
          email: user.email || "",
          storeName: updatedProduct!.store.name,
          username: user.name || "",
          productName: updatedProduct!.name,
          categoryName: updatedProduct!.category.name,
        });
      })
    );

    return new Response(JSON.stringify({ message: "Product Created!" }));
  } catch (err) {
    return new Response("Internal Error", { status: 500 });
  }
}
