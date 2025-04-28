"use server";

import { db } from "@/drizzle/db";
import {
  BannerTable,
  CategoryTable,
  ColorTable,
  ProductItemTable,
  ProductTable,
  SizeTable,
  StoreTable,
  StoreVerificationTokenTable,
} from "@/drizzle/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export const getFirstStoreByUserId = async (userId: string) => {
  try {
    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.userId, userId),
    });

    return store;
  } catch (err) {
    return null;
  }
};

export const getStoreVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken =
      await db.query.StoreVerificationTokenTable.findFirst({
        where: eq(StoreVerificationTokenTable.email, email),
      });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getStoresByUserId = async ({ userId }: { userId: string }) => {
  try {
    const stores = await db.query.StoreTable.findMany({
      where: and(
        eq(StoreTable.userId, userId),
        isNotNull(StoreTable.emailVerified)
      ),
    });

    return stores;
  } catch (err) {
    return [];
  }
};

// export const getStoreById = async ({
//   userId,
//   storeId,
// }: {
//   userId: string;
//   storeId: string;
// }) => {
//   try {
//     const store = await prismadb.store.findUnique({
//       where: {
//         id: storeId,
//         userId,
//         emailVerified: {
//           not: null,
//         },
//       },
//     });

//     return store;
//   } catch (err) {
//     return null;
//   }
// };

// export const getStoresByAdmin = async ({
//   status,
//   userRole,
// }: {
//   status?: string;
//   userRole?: UserRole;
// }) => {
//   try {
//     if (!userRole || userRole !== "ADMIN") {
//       return [];
//     }

//     let stores = [];

//     if (status && status !== "all") {
//       stores = await prismadb.store.findMany({
//         where: {
//           status: getStoreStatusValue(status),
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//       });
//     } else {
//       stores = await prismadb.store.findMany({
//         orderBy: {
//           createdAt: "desc",
//         },
//       });
//     }

//     return stores;
//   } catch (err) {
//     return [];
//   }
// };

export const getBannersByStoreId = async (storeId: string) => {
  try {
    if (!storeId) {
      return [];
    }

    const banners = await db.query.BannerTable.findMany({
      where: eq(BannerTable.storeId, storeId),
      orderBy: desc(BannerTable.createdAt),
    });

    return banners;
  } catch (err) {
    return [];
  }
};

export const getCategoriesByStoreId = async (storeId: string) => {
  try {
    if (!storeId) {
      return [];
    }
    const categories = await db
      .select({
        id: CategoryTable.id,
        storeId: CategoryTable.storeId,
        name: CategoryTable.name,
        createdAt: CategoryTable.createdAt,
        updatedAt: CategoryTable.updatedAt,
        _count: {
          products: db
            .$count(ProductTable, eq(ProductTable.categoryId, CategoryTable.id))
            .as("products"),
        },
      })
      .from(CategoryTable)
      .where(eq(CategoryTable.storeId, storeId))
      .orderBy(desc(CategoryTable.createdAt));

    // const categories = await prismadb.category.findMany({
    //   where: {
    //     storeId,
    //   },
    //   include: {
    //     _count: {
    //       select: {
    //         products: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return categories;
  } catch (err) {
    return [];
  }
};

export const getSizesByStoreId = async (storeId: string) => {
  try {
    if (!storeId) {
      return [];
    }

    const sizes = await db.query.SizeTable.findMany({
      where: eq(SizeTable.storeId, storeId),
      orderBy: desc(SizeTable.createdAt),
    });

    return sizes;
  } catch (err) {
    return [];
  }
};

export const getColorsByStoreId = async (storeId: string) => {
  try {
    if (!storeId) {
      return [];
    }

    const colors = await db.query.ColorTable.findMany({
      where: eq(ColorTable.storeId, storeId),
      orderBy: desc(ColorTable.createdAt),
    });

    return colors;
  } catch (err) {
    return [];
  }
};

export const getStore = async ({
  userId,
  storeId,
}: {
  userId: string;
  storeId: string;
}) => {
  try {
    if (!storeId || !userId) {
      return null;
    }

    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, userId)),
      columns: {
        id: true,
        status: true,
        statusFeedback: true,
      },
    });

    return store;
  } catch (err) {
    return null;
  }
};

export const getStoreDetails = async ({
  userId,
  storeId,
}: {
  userId: string;
  storeId: string;
}) => {
  try {
    if (!storeId || !userId) {
      return null;
    }

    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, userId)),
    });

    return store;
  } catch (err) {
    return null;
  }
};

export const getProductsByStoreId = async ({
  userId,
  storeId,
}: {
  userId: string;
  storeId: string;
}) => {
  try {
    if (!storeId || !userId) {
      return [];
    }

    const raw = await db
      .select({
        // ── product columns ─────────────────────────────────────────────────────
        id: ProductTable.id,
        userId: ProductTable.userId,
        storeId: ProductTable.storeId,
        name: ProductTable.name,
        categoryId: ProductTable.categoryId,
        description: ProductTable.description,
        status: ProductTable.status,
        statusFeedback: ProductTable.statusFeedback,
        createdAt: ProductTable.createdAt,
        updatedAt: ProductTable.updatedAt,
        // ── join in category name ──────────────────────────────────────────────
        categoryName: CategoryTable.name,
        // ── count related productItems ────────────────────────────────────────
        productItemsCount: db.$count(
          ProductItemTable,
          eq(ProductItemTable.productId, ProductTable.id)
        ),
      })
      .from(ProductTable)
      .leftJoin(CategoryTable, eq(CategoryTable.id, ProductTable.categoryId))
      .where(
        and(eq(ProductTable.userId, userId), eq(ProductTable.storeId, storeId))
      )
      .orderBy(desc(ProductTable.createdAt));

    const products = raw.map((r) => ({
      // all original product fields
      id: r.id,
      userId: r.userId,
      storeId: r.storeId,
      name: r.name,
      categoryId: r.categoryId,
      description: r.description,
      status: r.status,
      statusFeedback: r.statusFeedback,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,

      // nest category
      category: { name: r.categoryName },

      // nest count
      _count: { productItems: r.productItemsCount },
    }));

    return products;
  } catch (err) {
    return [];
  }
};
