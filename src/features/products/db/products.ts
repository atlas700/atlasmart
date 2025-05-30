"use server";

import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  CategoryTable,
  ProductItemTable,
  ProductTable,
  ReviewTable,
  SizeTable,
  StoreTable,
  UserRole,
} from "@/drizzle/schema";
import {
  getProductStatusValue,
  INFINITE_SCROLL_PAGINATION_RESULTS,
} from "@/lib/utils";
import {
  and,
  desc,
  eq,
  exists,
  getTableColumns,
  gt,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { RecommendedType } from "../../../../types";

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

export const getProductById = async (productId: string) => {
  try {
    if (!productId) {
      return null;
    }

    // const [result] = await db
    //   .select({
    //     ...getTableColumns(ProductTable),
    //     category: CategoryTable,
    //     store: StoreTable,
    //     review: ReviewTable,
    //     productItem: ProductItemTable,
    //     availableItem: AvailableItemTable,
    //     size: SizeTable,
    //   })
    //   .from(ProductTable)
    //   .where(
    //     and(eq(ProductTable.id, productId), eq(ProductTable.status, "APPROVED"))
    //   )
    //   .leftJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
    //   .leftJoin(StoreTable, eq(ProductTable.storeId, StoreTable.id))
    //   .leftJoin(
    //     ProductItemTable,
    //     eq(ProductTable.id, ProductItemTable.productId)
    //   )
    //   .leftJoin(
    //     AvailableItemTable,
    //     eq(ProductItemTable.id, AvailableItemTable.productItemId)
    //   )
    //   .leftJoin(SizeTable, eq(AvailableItemTable.sizeId, SizeTable.id))
    //   .leftJoin(ReviewTable, eq(ProductTable.id, ReviewTable.productId))
    //   .orderBy(desc(AvailableItemTable.createdAt));

    const product = await db.query.ProductTable.findFirst({
      where: and(
        eq(ProductTable.id, productId),
        eq(ProductTable.status, "APPROVED")
      ),
      with: {
        category: true,
        store: true,
        reviews: true,
        productItems: {
          with: {
            availableItems: {
              with: {
                size: true,
              },
              orderBy: desc(AvailableItemTable.createdAt),
            },
          },
        },
      },
    });

    return product;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getRecommendedProducts = async (product: RecommendedType) => {
  try {
    if (!product) return [];

    const recommendedProducts = await db
      .select({
        product: ProductTable,
        category: CategoryTable,
        productItems: {
          ...ProductItemTable,
          availableItems: {
            ...AvailableItemTable,
            size: SizeTable,
          },
          reviews: ReviewTable,
        },
      })
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
      .leftJoin(SizeTable, eq(AvailableItemTable.sizeId, SizeTable.id))
      .leftJoin(ReviewTable, eq(ProductTable.id, ReviewTable.productId))
      .where(
        and(
          ne(ProductTable.id, product.id),
          eq(ProductTable.status, "APPROVED"),
          or(eq(CategoryTable.name, product.category?.name ?? "")),
          eq(CategoryTable.name, product.category?.name ?? ""),
          eq(ProductTable.name, product.name),
          eq(ProductTable.name, product.name)
        )
      )
      .orderBy(desc(ProductTable.createdAt))
      .limit(10);

    // const recommendedProducts = await prismadb.product.findMany({
    //   where: {
    //     id: {
    //       not: product.id,
    //     },
    //     status: ProductStatus.APPROVED,
    //     OR: [
    //       {
    //         category: {
    //           OR: [
    //             {
    //               name: {
    //                 contains: product.category?.name,
    //               },
    //             },
    //             {
    //               name: {
    //                 equals: product.category?.name,
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         OR: [
    //           {
    //             name: {
    //               contains: product.name,
    //             },
    //           },
    //           {
    //             name: {
    //               equals: product.name,
    //             },
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   include: {
    //     category: true,
    //     productItems: {
    //       where: {
    //         availableItems: {
    //           some: {
    //             numInStocks: {
    //               gt: 0,
    //             },
    //           },
    //         },
    //       },
    //       include: {
    //         availableItems: {
    //           include: {
    //             size: true,
    //           },
    //           orderBy: {
    //             createdAt: "desc",
    //           },
    //         },
    //       },
    //     },
    //     reviews: {
    //       select: {
    //         value: true,
    //       },
    //     },
    //   },
    //   take: 10,
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return recommendedProducts;
  } catch (err) {
    return [];
  }
};

export const getProductsByAdmin = async ({
  status,
  userRole,
}: {
  status?: string;
  userRole?: UserRole;
}) => {
  try {
    if (!userRole || userRole !== "ADMIN") {
      return [];
    }

    let products = [];

    if (status && status !== "all") {
      products = await db
        .select({
          ...getTableColumns(ProductTable),
          category: {
            name: CategoryTable.name,
          },
          _count: {
            productItems: sql<number>`(
              SELECT COUNT(*)
              FROM ${ProductItemTable}
              WHERE ${ProductItemTable.productId} = ${ProductTable.id}
            )`,
          },
        })
        .from(ProductTable)
        .leftJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
        .where(eq(ProductTable.status, getProductStatusValue(status)))
        .orderBy(desc(ProductTable.createdAt));
    } else {
      products = await db
        .select({
          ...getTableColumns(ProductTable),
          category: {
            name: CategoryTable.name,
          },
          _count: {
            productItems: sql<number>`(
              SELECT COUNT(*)
              FROM ${ProductItemTable}
              WHERE ${ProductItemTable.productId} = ${ProductTable.id}
            )`,
          },
        })
        .from(ProductTable)
        .leftJoin(CategoryTable, eq(ProductTable.categoryId, CategoryTable.id))
        .orderBy(desc(ProductTable.createdAt));
    }

    return products;
  } catch (err) {
    return [];
  }
};
