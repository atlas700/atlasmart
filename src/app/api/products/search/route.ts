import { SearchBodySchema } from "@/lib/validators/search-body";
import { and, desc, eq, exists, gt, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { HomeProductType } from "../../../../../types";
import {
  AvailableItemTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  ReviewTable,
  SizeTable,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
export type Response = {
  products: HomeProductType[];
  hasMore: boolean;
};

export async function POST(request: Request): Promise<NextResponse<Response>> {
  try {
    const url = new URL(request.url);

    const { limit, page, q } = z
      .object({
        limit: z.string(),
        page: z.string(),
        q: z.string(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        q: url.searchParams.get("q"),
      });

    if (q === "") {
      return NextResponse.json({ products: [], hasMore: false });
    }

    const body = await request.json();

    const validatedBody = SearchBodySchema.parse(body);

    const {
      category: categoryName,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
    } = validatedBody;

    // Build base conditions
    let conditions = [
      eq(ProductTable.status, "APPROVED"),
      or(
        ilike(ProductTable.name, `%${q}%`),
        ilike(CategoryTable.name, `%${q}%`)
      ),
    ];

    // Add category filter if provided
    if (categoryName !== "") {
      conditions.push(ilike(CategoryTable.name, categoryName!));
    }

    // First fetch products with related tables
    // Note: Drizzle requires separate joins for relation traversal
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    // First, get the count of matching products
    // This is complex with Drizzle as we need to handle relations differently

    // For count, we'll need to use a raw SQL count or complex query construction
    const countQuery = db
      .select({ count: sql`count(*)` })
      .from(ProductTable)
      .leftJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
      .leftJoin(
        ProductItemTable,
        eq(ProductTable.id, ProductItemTable.productId)
      )
      .leftJoin(
        AvailableItemTable,
        eq(ProductItemTable.id, AvailableItemTable.productItemId)
      )
      .where(and(...conditions))
      .prepare("");

    const totalCountResult = await countQuery.execute();
    const totalCount = Number(totalCountResult[0]?.count || 0);

    // Fetch complete product data with needed relations
    const productsQuery = db
      .select()
      .from(ProductTable)
      .leftJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
      .where(and(...conditions))
      .orderBy(desc(ProductTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Execute the main query
    const productsWithCategory = await productsQuery.execute();

    // Process price and discount conditions
    // Note: These would typically be in the WHERE clause, but Drizzle handles relations differently
    let filteredProducts = productsWithCategory;

    if (minPrice && minPrice !== "" && maxPrice && maxPrice !== "") {
      // We'll need additional filtering on the results
      const minPriceNum = +minPrice;
      const maxPriceNum = +maxPrice;
      // This requires post-processing in Drizzle
    }

    if (
      minDiscount &&
      minDiscount !== "" &&
      maxDiscount &&
      maxDiscount !== ""
    ) {
      const minDiscountNum = +minDiscount;
      const maxDiscountNum = +maxDiscount;
      // This requires post-processing in Drizzle
    }

    // Now fetch related data for each product
    const products = await Promise.all(
      productsWithCategory.map(async ({ product: p }) => {
        // Fetch product items with stock > 0
        const productItems = await db
          .select()
          .from(ProductItemTable)
          .where(
            and(
              eq(ProductItemTable.productId, p.id),
              exists(
                db
                  .select()
                  .from(AvailableItemTable)
                  .where(
                    and(
                      eq(AvailableItemTable.productItemId, ProductItemTable.id),
                      gt(AvailableItemTable.numInStocks, 0)
                    )
                  )
              )
            )
          )
          .execute();

        // Fetch available items for each product item
        const itemsWithAvailability = await Promise.all(
          productItems.map(async (item) => {
            const availableItems = await db
              .select()
              .from(AvailableItemTable)
              .leftJoin(SizeTable, eq(AvailableItemTable.sizeId, SizeTable.id))
              .where(
                and(
                  eq(AvailableItemTable.productItemId, item.id),
                  gt(AvailableItemTable.numInStocks, 0)
                )
              )
              .execute();

            return {
              ...item,
              availableItems,
            };
          })
        );

        // Fetch reviews
        const reviews = await db
          .select({ value: ReviewTable.value })
          .from(ReviewTable)
          .where(eq(ReviewTable.productId, p.id))
          .execute();

        return {
          ...p,
          category: productsWithCategory.find((pc) => pc.product.id === p.id)
            ?.categories,
          productItems: itemsWithAvailability,
          reviews,
        };
      })
    );

    // Apply the price and discount filters as post-processing
    // Note: This is less efficient than doing it in SQL, but Drizzle's relation handling requires this approach
    let filteredResult = products;

    if (minPrice && minPrice !== "" && maxPrice && maxPrice !== "") {
      const minPriceNum = +minPrice;
      const maxPriceNum = +maxPrice;

      filteredResult = filteredResult.filter((product) =>
        product.productItems.some((item) =>
          item.availableItems.some(
            (available) =>
              available.available_item.currentPrice >= minPriceNum &&
              available.available_item.currentPrice <= maxPriceNum
          )
        )
      );
    }

    if (
      minDiscount &&
      minDiscount !== "" &&
      maxDiscount &&
      maxDiscount !== ""
    ) {
      const minDiscountNum = +minDiscount;
      const maxDiscountNum = +maxDiscount;

      filteredResult = filteredResult.filter((product) =>
        product.productItems.some(
          (item) =>
            item.discount >= minDiscountNum && item.discount <= maxDiscountNum
        )
      );
    }

    return NextResponse.json({
      products: filteredResult,
      hasMore:
        filteredResult.length === limitNum &&
        parseInt(page) * limitNum < totalCount,
    });
  } catch (err) {
    console.error("GET_SEARCHED_PRODUCTS", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
