import { db } from "@/drizzle/db";
import { ProductTable, userRoles } from "@/drizzle/schema";
import { ProductStatusSchema } from "@/lib/validators/product-status";
import { getCurrentUser } from "@/services/clerk";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized", { status: 401 });
    }

    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
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
    });

    return new Response(JSON.stringify(product));
  } catch (err) {
    console.log("[PRODUCT_ADMIN_GET]", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (user.role !== userRoles[1]) {
      return new Response("Unauthorized", { status: 401 });
    }

    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });

    if (!product) {
      return new Response("Product not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ProductStatusSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { status, statusFeedback } = validatedBody;

    if (!status || !statusFeedback) {
      return new Response("Status and feedback required!", { status: 400 });
    }

    await db
      .update(ProductTable)
      .set({
        status,
        statusFeedback,
      })
      .where(eq(ProductTable.id, productId));

    return new Response(JSON.stringify({ message: "Status updated!" }));
  } catch (err) {
    console.log("[PRODUCT_STATUS_PATCH]", err);

    return new Response("Internal Error", { status: 500 });
  }
}
