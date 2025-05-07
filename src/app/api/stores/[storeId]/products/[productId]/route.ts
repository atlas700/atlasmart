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
import { sendDeletedProductEmail, sendUpdatedProductEmail } from "@/lib/mail";
import { apiRatelimit } from "@/lib/redis";
import { getCurrentPrice } from "@/lib/utils";
import { ProductSchema } from "@/lib/validators/product";
import { getCurrentUser } from "@/services/clerk";
import { and, desc, eq, inArray } from "drizzle-orm";
import { UUIDTypes } from "uuid";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user || !user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
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

    const { storeId, productId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
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

    //Check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: and(
        eq(ProductTable.id, productId),
        eq(ProductTable.storeId, storeId)
      ),
    });

    if (!product) {
      return new Response("Product not found", {
        status: 404,
      });
    }

    //Check if there is an existing product item
    const existingProductItems = await db.query.ProductItemTable.findMany({
      where: inArray(
        ProductItemTable.id,
        productItems.map((item) => item.id)
      ),
      with: {
        availableItems: true,
      },
    });

    //if there are existing product items update them else create new ones.
    await Promise.all(
      productItems.map(async (item) => {
        const existingItem = existingProductItems.find(
          (existing) => existing.id === item.id
        );

        if (existingItem) {
          await db
            .update(ProductItemTable)
            .set({
              colorIds: item.colorIds || [],
              images: item.images,
              discount: item.discount || 0,
            })
            .where(
              and(
                eq(ProductItemTable.id, existingItem.id),
                eq(ProductItemTable.productId, product.id)
              )
            );

          const updatedAvailableItems = item.availableItems;

          await Promise.all(
            updatedAvailableItems.map(async (item) => {
              const existingAvailableItem = existingItem.availableItems.find(
                (existingItem) => existingItem.id === item.id
              );

              if (existingAvailableItem) {
                await db
                  .update(AvailableItemTable)
                  .set({
                    sizeId: item.sizeId,
                    numInStocks: item.numInStocks,
                    originalPrice: item.price,
                    currentPrice: getCurrentPrice({
                      price: item.price,
                      discount: existingItem.discount || 0,
                    }),
                  })
                  .where(
                    and(
                      eq(AvailableItemTable.id, item.id),
                      eq(
                        AvailableItemTable.productId,
                        existingAvailableItem.productId
                      ),
                      eq(AvailableItemTable.productItemId, existingItem.id)
                    )
                  );
              } else {
                await db.insert(AvailableItemTable).values({
                  productId: product.id,
                  productItemId: existingItem.id,
                  sizeId: item.sizeId,
                  numInStocks: item.numInStocks,
                  originalPrice: item.price,
                  currentPrice: getCurrentPrice({
                    price: item.price,
                    discount: existingItem.discount || 0,
                  }),
                });
              }
            })
          );
        } else {
          const [productItem] = await db
            .insert(ProductItemTable)
            .values({
              productId: product.id,
              colorIds: item.colorIds || [],
              images: item.images,
              discount: item.discount || 0,
            })
            .returning();

          await Promise.all(
            item.availableItems.map(async (item) => {
              await db.insert(AvailableItemTable).values({
                productId: product.id,
                productItemId: productItem!.id,
                sizeId: item.sizeId,
                numInStocks: item.numInStocks,
                originalPrice: item.price,
                currentPrice: getCurrentPrice({
                  price: item.price,
                  discount: productItem!.discount || 0,
                }),
              });
            })
          );
        }
      })
    );

    //Update Product
    const [updatedProduct] = await db
      .update(ProductTable)
      .set({
        name,
        categoryId,
        description,
        status: "APPROVED",
        statusFeedback:
          "Your product has been approved. It will be shown to potential customers.",
      })
      .where(
        and(eq(ProductTable.id, productId), eq(ProductTable.storeId, storeId))
      )
      .returning({
        name: ProductTable.name,
        category: {
          name: CategoryTable.name,
        },
      });

    //Send email confirmation
    await sendUpdatedProductEmail({
      email: user.email || "",
      storeName: store.name,
      username: user.name || "",
      productName: updatedProduct!.name,
      categoryName: updatedProduct!.category.name,
    });

    return new Response(JSON.stringify({ message: "Product Updated!" }));
  } catch (err) {
    console.log("[PRODUCT_UPDATE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== "SELLER") {
      return new Response("Unauthorized", { status: 401 });
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

    //Check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: and(
        eq(ProductTable.id, productId),
        eq(ProductTable.storeId, storeId)
      ),
    });

    if (!product) {
      return new Response("Product not found", {
        status: 404,
      });
    }

    //Delete Product
    await db
      .delete(ProductTable)
      .where(
        and(eq(ProductTable.id, product.id), eq(ProductTable.storeId, storeId))
      );

    //Send email confirmation
    await sendDeletedProductEmail({
      email: user.email || "",
      storeName: store.name,
      username: user.name || "",
      productName: product.name || "Unknown",
    });

    return new Response(JSON.stringify({ message: "Product Deleted!" }));
  } catch (err) {
    console.log("[PRODUCT_DELETE]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== "SELLER") {
      return new Response("Unauthorized", { status: 401 });
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

    //Get Product
    const product = await db.query.ProductTable.findFirst({
      where: and(
        eq(ProductTable.id, productId),
        eq(ProductTable.storeId, storeId)
      ),
      with: {
        productItems: {
          with: {
            availableItems: {
              with: {
                size: true,
              },
            },
          },
        },
      },
      orderBy: desc(ProductTable.createdAt),
    });

    return new Response(JSON.stringify(product));
  } catch (err) {
    console.log("[PRODUCT_GET]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
