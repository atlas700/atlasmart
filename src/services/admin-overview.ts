"use server";

import { db } from "@/drizzle/db";
import { userRoles, UserTable } from "@/drizzle/schema";
import { eq, not } from "drizzle-orm";

export async function getUsersCount() {
  return db.query.UserTable.findMany({
    where: not(eq(UserTable.role, userRoles[1])),
  });
}

// export const getStoreChartData = async (): Promise<
//   { name: string; value: number }[]
// > => {
//   try {
//     const closedStoresCount = await await prismadb.store.count({
//       where: {
//         emailVerified: {
//           not: null,
//         },
//         status: storeStatus.CLOSED,
//       },
//     });

//     const pendingStoresCount = await await prismadb.store.count({
//       where: {
//         emailVerified: {
//           not: null,
//         },
//         status: storeStatus.PENDING,
//       },
//     });

//     const approvedStoresCount = await await prismadb.store.count({
//       where: {
//         emailVerified: {
//           not: null,
//         },
//         status: storeStatus.APPROVED,
//       },
//     });

//     const declinedStoresCount = await await prismadb.store.count({
//       where: {
//         emailVerified: {
//           not: null,
//         },
//         status: storeStatus.DECLINED,
//       },
//     });

//     const reviewingStoresCount = await await prismadb.store.count({
//       where: {
//         emailVerified: {
//           not: null,
//         },
//         status: storeStatus.REVIEWING,
//       },
//     });

//     return [
//       {
//         name: "Pending",
//         value: pendingStoresCount + 1,
//       },
//       {
//         name: "Reviewing",
//         value: reviewingStoresCount + 1,
//       },
//       { name: "Delined", value: declinedStoresCount + 1 },
//       { name: "Approved", value: approvedStoresCount + 1 },
//       { name: "Closed", value: closedStoresCount + 1 },
//     ];
//   } catch (err) {
//     return [];
//   }
// };

// export const getProductChartData = async (): Promise<
//   { name: string; value: number }[]
// > => {
//   try {
//     const pendingCount = await await prismadb.product.count({
//       where: {
//         status: ProductStatus.PENDING,
//       },
//     });

//     const reviewingCount = await await prismadb.product.count({
//       where: {
//         status: ProductStatus.REVIEWING,
//       },
//     });

//     const approvedCount = await await prismadb.product.count({
//       where: {
//         status: ProductStatus.APPROVED,
//       },
//     });

//     const declinedCount = await await prismadb.product.count({
//       where: {
//         status: ProductStatus.DECLINED,
//       },
//     });

//     const archivedCount = await await prismadb.product.count({
//       where: {
//         status: ProductStatus.ARCHIVED,
//       },
//     });

//     return [
//       {
//         name: "Pending",
//         value: pendingCount + 1,
//       },
//       {
//         name: "Reviewing",
//         value: reviewingCount + 1,
//       },
//       { name: "Delined", value: declinedCount + 1 },
//       { name: "Approved", value: approvedCount + 1 },
//       { name: "Archived", value: archivedCount + 1 },
//     ];
//   } catch (err) {
//     return [];
//   }
// };
