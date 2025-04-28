import { z } from "zod";
import { ReviewSchema } from "@/lib/validators/review";
import { db } from "@/drizzle/db";
import { desc, eq } from "drizzle-orm";
import { ProductTable, ReviewTable, userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const url = new URL(request.url);

    const { limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    const { productId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    //check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });

    if (!product) {
      return new Response("Product not found!", { status: 404 });
    }

    const reviews = await db.query.ReviewTable.findMany({
      where: eq(ProductTable.id, productId),
      with: {
        user: {
          columns: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: desc(ReviewTable.createdAt),
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return new Response(JSON.stringify(reviews));
  } catch (err) {
    console.log("GET_REVIEWS", err);

    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return new Response("Product Id is required", { status: 400 });
    }

    const { user } = await getCurrentUser();

    if (!user) {
      return new Response(
        "Unauthorized, You need to be logged in to add a review",
        { status: 401 }
      );
    }

    //Check if user role is USER
    if (user.role !== userRoles[0]) {
      return new Response("Unauthorized, Only users can add review", {
        status: 401,
      });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ReviewSchema.parse(body);
    } catch (err) {
      return new Response(JSON.stringify("Invalid Credentials"), {
        status: 400,
      });
    }

    const { value, reason, comment } = validatedBody;

    //check if product exists
    const product = await db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });

    if (!product) {
      return new Response("Product not found!", { status: 404 });
    }

    await db.insert(ReviewTable).values({
      userId: user.id,
      productId,
      storeId: product.storeId,
      value,
      comment,
      reason,
    });

    return new Response(JSON.stringify({ message: "Review Created!" }));
  } catch (err) {
    console.log("CREATE_REVIEW", err);

    return new Response("Internal Error", { status: 500 });
  }
}
