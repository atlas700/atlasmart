import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  ProductItemTable,
  ProductTable,
} from "@/drizzle/schema";
import { and, desc, eq, sql } from "drizzle-orm";
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

    const products = await db.query.ProductTable.findMany({
      where: and(
        eq(ProductTable.status, "APPROVED"),
        sql`EXISTS (
      SELECT 1 FROM ${ProductItemTable} 
      WHERE ${ProductItemTable.productId} = ${ProductTable.id} 
      AND EXISTS (
        SELECT 1 FROM ${AvailableItemTable} 
        WHERE ${AvailableItemTable.productItemId} = ${ProductItemTable.id} 
        AND ${AvailableItemTable.numInStocks} > 0
      )
    )`
      ),
      with: {
        category: true,
        productItems: {
          where: sql`EXISTS (
          SELECT 1 FROM ${AvailableItemTable} 
          WHERE ${AvailableItemTable.productItemId} = ${ProductItemTable.id} 
          AND ${AvailableItemTable.numInStocks} > 0
        )`,
          with: {
            availableItems: {
              with: {
                size: true,
              },
            },
          },
        },
        reviews: {
          columns: {
            value: true,
          },
        },
      },
      orderBy: (product) => [desc(product.createdAt)],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return new Response(JSON.stringify(products));
  } catch (err) {
    return new Response(JSON.stringify("Internal server error"), {
      status: 500,
    });
  }
}
