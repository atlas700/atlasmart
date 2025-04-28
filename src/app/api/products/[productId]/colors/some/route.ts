import { db } from "@/drizzle/db";
import { ColorTable, ProductTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
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

    const body = await request.json();

    const { colorIds } = body;

    const colors = await Promise.all(
      colorIds.map(async (id: string) => {
        const color = await db.query.ColorTable.findFirst({
          where: eq(ColorTable.id, id),
        });

        return color;
      })
    );

    return new Response(JSON.stringify(colors));
  } catch (err) {
    console.log("GET_COLORS_SOME_PRODUCT", err);

    return new Response("Internal Error", { status: 500 });
  }
}
