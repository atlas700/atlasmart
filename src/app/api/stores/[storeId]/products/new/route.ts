import prismadb from "@/lib/prisma";
import { apiRatelimit } from "@/lib/redis";
import { NextResponse } from "next/server";
import { getCurrentPrice } from "@/lib/utils";
import { checkText } from "@/actions/checkText";
import { sendCreatedProductEmail } from "@/lib/mail";
import { UserRole, storeStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { ProductSchema } from "@/lib/validators/product";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.role !== UserRole.SELLER) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = await apiRatelimit.limit(user.id);

    if (!success && process.env.VERCEL_ENV === "production") {
      return NextResponse.json("Too Many Requests! try again in 1 min", {
        status: 429,
      });
    }

    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
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

    //Create Product
    const product = await prismadb.product.create({
      data: {
        userId: user.id,
        storeId,
        name,
        categoryId,
        description,
      },
    });

    //Create product items
    await Promise.all(
      productItems.map(async (item) => {
        const productItem = await prismadb.productItem.create({
          data: {
            productId: product?.id,
            images: item.images,
            colorIds: item.colorIds || [],
            discount: item.discount,
          },
        });

        await prismadb.available.createMany({
          data: item.availableItems.map((item) => ({
            productId: product?.id,
            productItemId: productItem.id,
            sizeId: item.sizeId,
            numInStocks: item.numInStocks,
            originalPrice: item.price,
            currentPrice: getCurrentPrice({
              price: item.price,
              discount: productItem.discount || 0,
            }),
          })),
        });

        const updatedProduct = await prismadb.product.update({
          where: {
            id: product?.id,
          },
          data: {
            status: "APPROVED",
            statusFeedback:
              "Your product has been approved. It will be shown to potential customers.",
          },
          select: {
            name: true,
            store: {
              select: {
                name: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        });

        //Send email confirmation
        await sendCreatedProductEmail({
          email: user.email || "",
          storeName: updatedProduct.store.name,
          username: user.name || "",
          productName: updatedProduct.name,
          categoryName: updatedProduct.category.name,
        });
      })
    );

    return NextResponse.json({ message: "Product Created!" });
  } catch (err) {
    console.log("[PRODUCT_CREATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
