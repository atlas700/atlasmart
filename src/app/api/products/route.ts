import { db } from "@/drizzle/db";
import { AvailableItemTable, ProductTable } from "@/drizzle/schema";
import { desc, eq, gt } from "drizzle-orm";
import { z } from "zod";

export async function GET(request: Request) {
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

    const limitNum = parseInt(limit, 10); // pagination params :contentReference[oaicite:0]{index=0}
    const offsetNum = (parseInt(page, 10) - 1) * limitNum; // pagination params :contentReference[oaicite:1]{index=1}

    const products = await db.query.ProductTable.findMany({
      where: eq(ProductTable.status, "APPROVED"), // filter approved only
      limit: limitNum,
      offset: offsetNum,
      orderBy: desc(ProductTable.createdAt), // sort by createdAt DESC

      with: {
        category: true, // include 1:1 category
        productItems: {
          with: {
            availableItems: {
              where: gt(AvailableItemTable.numInStocks, 0), // only items in stock
              with: {
                size: true, // include size object
              },
            },
          },
        },
        reviews: {
          columns: { value: true }, // select only review value
        },
      },
    });

    return new Response(JSON.stringify(products));
  } catch (err) {
    return new Response("Internal Error", { status: 500 });
  }
}
