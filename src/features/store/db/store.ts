"use server";

import { db } from "@/drizzle/db";
import { StoreTable, StoreVerificationTokenTable } from "@/drizzle/schema";
import { and, eq, isNotNull } from "drizzle-orm";

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

// export const getBannersByStoreId = async (storeId: string) => {
//   try {
//     if (!storeId) {
//       return [];
//     }

//     const banners = await prismadb.banner.findMany({
//       where: {
//         storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return banners;
//   } catch (err) {
//     return [];
//   }
// };

// export const getCategoriesByStoreId = async (storeId: string) => {
//   try {
//     if (!storeId) {
//       return [];
//     }

//     const categories = await prismadb.category.findMany({
//       where: {
//         storeId,
//       },
//       include: {
//         _count: {
//           select: {
//             products: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return categories;
//   } catch (err) {
//     return [];
//   }
// };

// export const getSizesByStoreId = async (storeId: string) => {
//   try {
//     if (!storeId) {
//       return [];
//     }

//     const sizes = await prismadb.size.findMany({
//       where: {
//         storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return sizes;
//   } catch (err) {
//     return [];
//   }
// };

// export const getColorsByStoreId = async (storeId: string) => {
//   try {
//     if (!storeId) {
//       return [];
//     }

//     const colors = await prismadb.color.findMany({
//       where: {
//         storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return colors;
//   } catch (err) {
//     return [];
//   }
// };

// export const getStore = async ({
//   userId,
//   storeId,
// }: {
//   userId: string;
//   storeId: string;
// }) => {
//   try {
//     if (!storeId || !userId) {
//       return null;
//     }

//     const store = await prismadb.store.findUnique({
//       where: {
//         id: storeId,
//         userId,
//       },
//       select: {
//         id: true,
//         status: true,
//         statusFeedback: true,
//       },
//     });

//     return store;
//   } catch (err) {
//     return null;
//   }
// };

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

// export const getProductsByStoreId = async ({
//   userId,
//   storeId,
// }: {
//   userId: string;
//   storeId: string;
// }) => {
//   try {
//     if (!storeId || !userId) {
//       return [];
//     }

//     const products = await prismadb.product.findMany({
//       where: {
//         userId,
//         storeId,
//       },
//       include: {
//         category: {
//           select: {
//             name: true,
//           },
//         },
//         _count: {
//           select: {
//             productItems: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return products;
//   } catch (err) {
//     return [];
//   }
// };
