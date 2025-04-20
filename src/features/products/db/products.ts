import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  ReviewTable,
  SizeTable,
} from "@/drizzle/schema";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/lib/utils";
import { and, desc, eq, exists, gt } from "drizzle-orm";

export const getHomePageProducts = async () => {
  try {
    const products = await db
      .select()
      .from(ProductTable)
      .innerJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
      .leftJoin(
        ProductItemTable,
        and(
          eq(ProductItemTable.productId, ProductTable.id),
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
      .leftJoin(
        AvailableItemTable,
        eq(AvailableItemTable.productItemId, ProductItemTable.id)
      )
      .leftJoin(SizeTable, eq(AvailableItemTable.sizeId, SizeTable.id))
      .leftJoin(ReviewTable, eq(ReviewTable.productId, ProductTable.id))
      .where(
        and(
          eq(ProductTable.status, "APPROVED"),
          exists(
            db
              .select()
              .from(ProductItemTable)
              .innerJoin(
                AvailableItemTable,
                eq(AvailableItemTable.productItemId, ProductItemTable.id)
              )
              .where(
                and(
                  eq(ProductItemTable.productId, ProductTable.id),
                  gt(AvailableItemTable.numInStocks, 0)
                )
              )
          )
        )
      )
      .orderBy(desc(ProductTable.createdAt))
      .limit(INFINITE_SCROLL_PAGINATION_RESULTS)
      .then((rows) => {
        // Transform the joined data back into the nested structure
        // This part requires custom transformation logic
        const productMap = new Map();

        for (const row of rows) {
          if (!productMap.has(row.product.id)) {
            productMap.set(row.product.id, {
              ...row.product,
              category: row.categories,
              productItems: [],
              reviews: [],
            });
          }

          const productData = productMap.get(row.product.id);

          // Add product item if not already added
          if (
            row.product_item &&
            !productData.productItems.some(
              (item: any) => item.id === row!.product_item!.id
            )
          ) {
            productData.productItems.push({
              ...row.product_item,
              availableItems: [],
            });
          }

          // Add available item if applicable
          if (row.available_item && row.product_item) {
            const productItem = productData.productItems.find(
              (item: any) => item.id === row!.product_item!.id
            );
            if (
              productItem &&
              !productItem.availableItems.some(
                (item: any) => item.id === row!.available_item!.id
              )
            ) {
              productItem.availableItems.push({
                ...row.available_item,
                size: row.sizes,
              });
            }
          }

          // Add review if applicable
          if (
            row.review &&
            !productData.reviews.some((r: any) => r.id === row!.review!.id)
          ) {
            productData.reviews.push({
              value: row.review.value,
            });
          }
        }

        return Array.from(productMap.values());
      });

    return products;
  } catch (err) {
    return [];
  }
};
