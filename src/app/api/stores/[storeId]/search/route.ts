import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  StoreTable,
} from "@/drizzle/schema";
import { and, desc, eq, exists, gt, ilike, or } from "drizzle-orm";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const url = new URL(request.url);

    const { limit, page, q } = z
      .object({
        limit: z.string(),
        page: z.string(),
        q: z.string().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        q: url.searchParams.get("q"),
      });

    const { storeId } = await params;

    if (!storeId) {
      return new Response("Store Id is required", { status: 400 });
    }

    //check if store exists
    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.id, storeId),
      columns: {
        id: true,
      },
    });

    if (!store) {
      return new Response("Store not found!", { status: 404 });
    }

    let products = [];

    if (q && q.trim() !== "") {
      products = await db.query.ProductTable.findMany({
        where: and(
          eq(ProductTable.storeId, storeId),
          eq(ProductTable.status, "APPROVED"),
          or(
            ilike(ProductTable.name, `%${q}%`),
            ilike(ProductTable.name, q),
            exists(
              db
                .select()
                .from(CategoryTable)
                .where(
                  and(
                    eq(CategoryTable.id, ProductTable.categoryId),
                    or(
                      ilike(CategoryTable.name, `%${q}%`),
                      ilike(CategoryTable.name, q)
                    )
                  )
                )
            )
          ),
          exists(
            db
              .select()
              .from(ProductItemTable)
              .where(
                and(
                  eq(ProductItemTable.productId, ProductTable.id),
                  exists(
                    db
                      .select()
                      .from(AvailableItemTable)
                      .where(
                        and(
                          eq(
                            AvailableItemTable.productItemId,
                            ProductItemTable.id
                          ),
                          gt(AvailableItemTable.numInStocks, 0)
                        )
                      )
                  )
                )
              )
          )
        ),
        with: {
          category: true,
          productItems: {
            where: exists(
              db
                .select()
                .from(AvailableItemTable)
                .where(
                  and(
                    eq(AvailableItemTable.productItemId, ProductItemTable.id),
                    gt(AvailableItemTable.numInStocks, 0)
                  )
                )
            ),
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
        orderBy: desc(ProductTable.createdAt),
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });
    } else {
      products = await db.query.ProductTable.findMany({
        where: and(
          eq(ProductTable.storeId, storeId),
          eq(ProductTable.status, "APPROVED"),
          exists(
            db
              .select()
              .from(ProductItemTable)
              .where(
                and(
                  eq(ProductItemTable.productId, ProductTable.id),
                  exists(
                    db
                      .select()
                      .from(AvailableItemTable)
                      .where(
                        and(
                          eq(
                            AvailableItemTable.productItemId,
                            ProductItemTable.id
                          ),
                          gt(AvailableItemTable.numInStocks, 0)
                        )
                      )
                  )
                )
              )
          )
        ),
        with: {
          category: true,
          productItems: {
            where: exists(
              db
                .select()
                .from(AvailableItemTable)
                .where(
                  and(
                    eq(AvailableItemTable.productItemId, ProductItemTable.id),
                    gt(AvailableItemTable.numInStocks, 0)
                  )
                )
            ),
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
        orderBy: desc(ProductTable.createdAt),
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });
    }

    return new Response(JSON.stringify(products));
  } catch (err) {
    console.log("GET_STORE_PRODUCTS", err);

    return new Response("Internal Error", { status: 500 });
  }
}
