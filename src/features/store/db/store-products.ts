"use server";

import Product from "@/app/[locale]/(marketing)/_components/Product";
import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  BannerTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  ReviewTable,
  SizeTable,
  StoreTable,
} from "@/drizzle/schema";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/lib/utils";
import {
  and,
  desc,
  eq,
  exists,
  getTableColumns,
  gt,
  ilike,
  or,
} from "drizzle-orm";

export const getProductStore = async (storeId: string) => {
  try {
    if (!storeId) return null;

    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.id, storeId),
      with: {
        banners: {
          where: eq(BannerTable.active, true),
        },
      },
    });

    return store;
  } catch (err) {
    return null;
  }
};

export const getStoreProducts = async ({
  storeId,
  search,
}: {
  storeId: string;
  search: string;
}) => {
  try {
    if (!storeId) return [];

    let products = [];

    if (search && search.trim() !== "") {
      products = await db
        .select({
          product: ProductTable,
          category: CategoryTable,
          productItems: {
            ...ProductItemTable,
            availableItems: {
              ...AvailableItemTable,
              size: SizeTable,
            },
          },
          reviews: ReviewTable,
        })
        .from(ProductTable)
        .leftJoin(CategoryTable, eq(CategoryTable.id, ProductTable.categoryId))
        .leftJoin(
          ProductItemTable,
          eq(ProductItemTable.productId, ProductTable.id)
        )
        .leftJoin(
          AvailableItemTable,
          eq(AvailableItemTable.productItemId, ProductItemTable.id)
        )
        .leftJoin(ReviewTable, eq(ReviewTable.productId, ProductTable.id))
        .where(
          and(
            eq(ProductTable.storeId, storeId),
            eq(ProductTable.status, "APPROVED"),
            or(
              ilike(ProductTable.name, `%${search}%`),
              eq(ProductTable.name, search),
              ilike(CategoryTable.name, `%${search}%`),
              eq(CategoryTable.name, search)
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
          )
        )
        .orderBy(desc(ProductTable.createdAt))
        .limit(INFINITE_SCROLL_PAGINATION_RESULTS);
    } else {
      products = await db
        .select({
          product: ProductTable,
          category: CategoryTable,
          productItems: {
            ...ProductItemTable,
            availableItems: {
              ...AvailableItemTable,
              size: SizeTable,
            },
          },
          reviews: ReviewTable,
        })
        .from(ProductTable)
        .leftJoin(CategoryTable, eq(CategoryTable.id, ProductTable.categoryId))
        .leftJoin(
          ProductItemTable,
          eq(ProductItemTable.productId, ProductTable.id)
        )
        .leftJoin(
          AvailableItemTable,
          eq(AvailableItemTable.productItemId, ProductItemTable.id)
        )
        .leftJoin(ReviewTable, eq(ReviewTable.productId, ProductTable.id))
        .where(
          and(
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
          )
        )
        .orderBy(desc(ProductTable.createdAt))
        .limit(INFINITE_SCROLL_PAGINATION_RESULTS);
    }

    return products;
  } catch (err) {
    return [];
  }
};
