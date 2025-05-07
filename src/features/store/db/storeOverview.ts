"use server";

import { db } from "@/drizzle/db";
import {
  AvailableItemTable,
  BannerTable,
  OrderItemTable,
  OrderTable,
  ProductTable,
  StoreTable,
} from "@/drizzle/schema";
import { and, eq, gt, inArray, isNotNull } from "drizzle-orm";

export const getStore = async ({
  userId,
  storeId,
}: {
  userId: string;
  storeId: string;
}) => {
  try {
    const store = await db.query.StoreTable.findFirst({
      where: and(
        eq(StoreTable.id, storeId),
        eq(StoreTable.userId, userId),
        isNotNull(StoreTable.emailVerified)
      ),
      columns: {
        name: true,
        description: true,
        status: true,
      },
    });

    return store;
  } catch (err) {
    return null;
  }
};

export const getStoreBanner = async ({ storeId }: { storeId: string }) => {
  try {
    const banner = await db.query.BannerTable.findFirst({
      where: and(
        eq(BannerTable.storeId, storeId),
        eq(BannerTable.active, true)
      ),
      columns: {
        image: true,
      },
    });

    return banner;
  } catch (err) {
    return null;
  }
};

export const getTotalRevenue = async ({ storeId }: { storeId: string }) => {
  try {
    let totalRevenue = 0;

    const orders = await db.query.OrderTable.findMany({
      where: inArray(OrderTable.status, [
        "CONFIRMED",
        "READYFORSHIPPING",
        "SHIPPED",
        "OUTFORDELIVERY",
        "DELIVERED",
        "RETURNREQUESTED",
        "RETURNING",
      ]),
      with: {
        orderItems: {
          where: eq(OrderItemTable.storeId, storeId),
          columns: { quantity: true },
          with: {
            availableItem: {
              columns: {
                currentPrice: true,
              },
            },
          },
        },
      },
      columns: {},
    });

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const itemTotal = item.quantity * item.availableItem.currentPrice;

        totalRevenue += itemTotal;
      });
    });

    return totalRevenue;
  } catch (err) {
    return 0;
  }
};

export const getSalesCountByStoreId = async ({
  storeId,
}: {
  storeId: string;
}) => {
  try {
    const sales = await db.query.OrderTable.findMany({
      where: inArray(OrderTable.status, [
        "CONFIRMED",
        "READYFORSHIPPING",
        "SHIPPED",
        "OUTFORDELIVERY",
        "DELIVERED",
        "RETURNREQUESTED",
        "RETURNING",
      ]),
      with: {
        orderItems: {
          where: eq(OrderItemTable.storeId, storeId),
          columns: { quantity: true },
          with: {
            availableItem: {
              columns: {},
            },
          },
        },
      },
      columns: {},
    });
    const salesCount = sales.reduce((acc, order) => {
      const orderTotal = order.orderItems.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    return salesCount;
  } catch (err) {
    return 0;
  }
};

export const getNumOfProductsInStock = async ({
  storeId,
}: {
  storeId: string;
}) => {
  try {
    const product = await db.query.ProductTable.findMany({
      where: and(
        eq(ProductTable.storeId, storeId),
        eq(ProductTable.status, "APPROVED")
      ),
      with: {
        productItems: {
          columns: { id: true },
          with: {
            availableItems: {
              where: gt(AvailableItemTable.numInStocks, 0),
              columns: { id: true, numInStocks: true },
            },
          },
        },
      },
      columns: {
        id: true,
      },
    });

    const productCount = product.reduce((acc, item) => {
      const availableItemsCount = item.productItems.reduce(
        (acc, item) => acc + item.availableItems.length,
        0
      );
      return acc + availableItemsCount;
    }, 0);

    return productCount;
  } catch (err) {
    return 0;
  }
};

export const getGraphData = async (
  storeId: string
): Promise<{ name: string; total: number }[]> => {
  try {
    if (!storeId) return [];

    const orders = await db.query.OrderTable.findMany({
      with: {
        orderItems: {
          where: eq(OrderItemTable.storeId, storeId),
          columns: { quantity: true },
          with: {
            availableItem: {
              columns: { currentPrice: true },
            },
          },
        },
      },
      columns: { createdAt: true },
    });

    const monthlyRevenue: { [key: number]: number } = {};

    for (const order of orders) {
      const month = order.createdAt.getMonth();

      let revenueForOrder = 0;

      for (const item of order.orderItems) {
        revenueForOrder += item.availableItem.currentPrice * item.quantity;
      }

      // Adding the revenue for this order to the respective month
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    }

    // Converting the grouped data into the format expected by the graph
    const graphData: { name: string; total: number }[] = [
      { name: "Jan", total: 0 },
      { name: "Feb", total: 0 },
      { name: "Mar", total: 0 },
      { name: "Apr", total: 0 },
      { name: "May", total: 0 },
      { name: "Jun", total: 0 },
      { name: "Jul", total: 0 },
      { name: "Aug", total: 0 },
      { name: "Sep", total: 0 },
      { name: "Oct", total: 0 },
      { name: "Nov", total: 0 },
      { name: "Dec", total: 0 },
    ];

    // Filling in the revenue data
    for (const month in monthlyRevenue) {
      // @ts-ignore
      graphData[parseInt(month!)].total = monthlyRevenue[parseInt(month)];
    }

    return graphData;
  } catch (err) {
    return [];
  }
};
