import prismadb from "@/lib/prisma";
import { apiRatelimit } from "@/lib/redis";
import { NextResponse } from "next/server";
import { getCurrentPrice } from "@/lib/utils";
import { checkText } from "@/actions/checkText";
import { currentUser } from "@/lib/auth";
import { UserRole, storeStatus } from "@prisma/client";
import { ProductSchema } from "@/lib/validators/product";
import { sendDeletedProductEmail, sendUpdatedProductEmail } from "@/lib/mail";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== UserRole.SELLER) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = await apiRatelimit.limit(user.id);

    if (!success && process.env.VERCEL_ENV === "production") {
      return NextResponse.json("Too Many Requests! try again in 1 min", {
        status: 429,
      });
    }

    const { storeId, productId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    //Check if the user owns the store
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    //Check if store has been approved
    if (store.status !== storeStatus.APPROVED) {
      return new NextResponse("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ProductSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, categoryId, description, productItems } = validatedBody;

    //Check if there is at least one product item
    if (productItems.length < 1) {
      return new NextResponse("At least one product item is required.", {
        status: 400,
      });
    }

    if (process.env.VERCEL_ENV === "production") {
      //Check if name and desctiption are appropiate
      const nameIsAppropiate = await checkText({ text: name });

      if (
        nameIsAppropiate.success === "NEGATIVE" ||
        nameIsAppropiate.success === "MIXED" ||
        nameIsAppropiate.error
      ) {
        return new NextResponse(
          "The name of your product is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }

      const descriptionIsAppropiate = await checkText({ text: description });

      if (
        descriptionIsAppropiate.success === "NEGATIVE" ||
        descriptionIsAppropiate.success === "MIXED" ||
        descriptionIsAppropiate.error
      ) {
        return new NextResponse(
          "The description of your product is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }
    }

    //Check if product exists
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", {
        status: 404,
      });
    }

    //Check if there is an existing product item
    const existingProductItems = await prismadb.productItem.findMany({
      where: {
        id: {
          in: [...productItems.map((item) => item.id)],
        },
      },
      include: {
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
          await prismadb.productItem.update({
            where: {
              id: existingItem.id,
              productId: product.id,
            },
            data: {
              colorIds: item.colorIds || [],
              images: item.images,
              discount: item.discount || 0,
            },
          });

          const updatedAvailableItems = item.availableItems;

          await Promise.all(
            updatedAvailableItems.map(async (item) => {
              const existingAvaliableItem = existingItem.availableItems.find(
                (existingItem) => existingItem.id === item.id
              );

              if (existingAvaliableItem) {
                await prismadb.available.update({
                  where: {
                    id: item.id,
                    productId: product.id,
                    productItemId: existingItem.id,
                  },
                  data: {
                    sizeId: item.sizeId,
                    numInStocks: item.numInStocks,
                    originalPrice: item.price,
                    currentPrice: getCurrentPrice({
                      price: item.price,
                      discount: existingItem.discount || 0,
                    }),
                  },
                });
              } else {
                await prismadb.available.create({
                  data: {
                    productId: product.id,
                    productItemId: existingItem.id,
                    sizeId: item.sizeId,
                    numInStocks: item.numInStocks,
                    originalPrice: item.price,
                    currentPrice: getCurrentPrice({
                      price: item.price,
                      discount: existingItem.discount || 0,
                    }),
                  },
                });
              }
            })
          );
        } else {
          const productItem = await prismadb.productItem.create({
            data: {
              productId: product.id,
              colorIds: item.colorIds || [],
              images: item.images,
              discount: item.discount || 0,
            },
          });

          await Promise.all(
            item.availableItems.map(async (item) => {
              await prismadb.available.create({
                data: {
                  productId: product.id,
                  productItemId: productItem.id,
                  sizeId: item.sizeId,
                  numInStocks: item.numInStocks,
                  originalPrice: item.price,
                  currentPrice: getCurrentPrice({
                    price: item.price,
                    discount: productItem.discount || 0,
                  }),
                },
              });
            })
          );
        }
      })
    );

    //Update Product
    const updatedProduct = await prismadb.product.update({
      where: {
        id: productId,
        storeId,
      },
      data: {
        name,
        categoryId,
        description,
        status: "APPROVED",
        statusFeedback:
          "Your product has been approved. It will be shown to potential customers.",
      },
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    //Send email confirmation
    await sendUpdatedProductEmail({
      email: user.email || "",
      storeName: store.name,
      username: user.name || "",
      productName: updatedProduct.name,
      categoryName: updatedProduct.category.name,
    });

    return NextResponse.json({ message: "Product Updated!" });
  } catch (err) {
    console.log("[PRODUCT_UPDATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { storeId, productId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== "SELLER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    //Check if store has been approved
    if (store.status !== storeStatus.APPROVED) {
      return new NextResponse("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    //Check if product exists
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", {
        status: 404,
      });
    }

    //Delete Product
    await prismadb.product.delete({
      where: {
        id: product.id,
        storeId,
      },
    });

    //Send email confirmation
    await sendDeletedProductEmail({
      email: user.email || "",
      storeName: store.name,
      username: user.name || "",
      productName: product.name || "Unknown",
    });

    return NextResponse.json({ message: "Product Deleted!" });
  } catch (err) {
    console.log("[PRODUCT_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { storeId, productId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== "SELLER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    //Check if store has been approved
    if (store.status !== storeStatus.APPROVED) {
      return new NextResponse("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    //Get Product
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
        storeId,
      },
      include: {
        productItems: {
          include: {
            availableItems: {
              include: {
                size: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.log("[PRODUCT_GET]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
