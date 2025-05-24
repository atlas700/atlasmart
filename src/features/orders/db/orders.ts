"use server";

import { db } from "@/drizzle/db";
import {
  OrderItemTable,
  OrderTable,
  StoreTable,
  userRoles,
  UserTable
} from "@/drizzle/schema";
import { getOrderStatusValue } from "@/lib/utils";
import { and, desc, eq } from "drizzle-orm";

export const getUserOrdersByStatus = async ({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) => {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
      columns: {
        id: true,
      },
    });

    if (!user || !user.id) {
      return [];
    }

    let orders = [];

    if (status && status !== "all") {
      orders = await db.query.OrderTable.findMany({
        where: eq(OrderTable.userId, user.id),
        with: {
          orderItems: {
            columns: {
              id: true,
              productId: true,
              productItemId: true,
              availableItemId: true,
              quantity: true,
            },
            with: {
              product: {
                columns: {
                  name: true,
                },
              },
              productItem: {
                columns: {
                  images: true,
                },
              },
              availableItem: {
                columns: {
                  currentPrice: true,
                },
                with: {
                  size: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: desc(OrderTable.createdAt),
      });
      // orders = await prismadb.order.findMany({
      //   where: {
      //     userId: user.id,
      //     status: getOrderStatusValue(status),
      //   },
      //   include: {
      //     orderItems: {
      //       include: {
      //         product: {
      //           select: {
      //             name: true,
      //           },
      //         },
      //         productItem: {
      //           select: {
      //             images: true,
      //           },
      //         },
      //         availableItem: {
      //           select: {
      //             currentPrice: true,
      //             size: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      //   orderBy: {
      //     createdAt: "desc",
      //   },
      // });
    } else {
      orders = await db.query.OrderTable.findMany({
        where: eq(OrderTable.userId, user.id),
        with: {
          orderItems: {
            columns: {
              id: true,
              productId: true,
              productItemId: true,
              availableItemId: true,
              quantity: true,
            },
            with: {
              product: {
                columns: {
                  name: true,
                },
              },
              productItem: {
                columns: {
                  images: true,
                },
              },
              availableItem: {
                columns: {
                  currentPrice: true,
                },
                with: {
                  size: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: desc(OrderTable.createdAt),
      });
      // orders = await prismadb.order.findMany({
      //   where: {
      //     userId: user.id,
      //   },
      //   include: {
      //     orderItems: {
      //       include: {
      //         product: {
      //           select: {
      //             name: true,
      //           },
      //         },
      //         productItem: {
      //           select: {
      //             images: true,
      //           },
      //         },
      //         availableItem: {
      //           select: {
      //             currentPrice: true,
      //             size: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      //   orderBy: {
      //     createdAt: "desc",
      //   },
      // });
    }

    return orders;
  } catch (err) {
    return [];
  }
};

export const getStoreOrdersByStatus = async ({
  storeId,
  status,
}: {
  storeId: string;
  status: string;
}) => {
  try {
    const store = await db.query.StoreTable.findFirst({
      where: eq(StoreTable.id, storeId),
      columns: {
        id: true,
      },
    });

    if (!store || !store.id) {
      return [];
    }

    let orders = [];

    if (status && status !== "all") {
      orders = await db.query.OrderItemTable.findMany({
        where: and(
          eq(OrderItemTable.storeId, store.id),
          eq(OrderTable.status, getOrderStatusValue(status))
        ),
        with: {
          order: {
            columns: {
              status: true,
            },
            with: {
              user: {
                columns: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          product: {
            columns: {
              name: true,
            },
          },
          productItem: {
            columns: {
              images: true,
            },
          },
          availableItem: {
            columns: {
              currentPrice: true,
            },
            with: {
              size: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: desc(OrderItemTable.createdAt),
      });
    } else {
      orders = await db.query.OrderItemTable.findMany({
        where: eq(OrderItemTable.storeId, store.id),
        with: {
          order: {
            columns: {
              status: true,
            },
            with: {
              user: {
                columns: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          product: {
            columns: {
              name: true,
            },
          },
          productItem: {
            columns: {
              images: true,
            },
          },
          availableItem: {
            columns: {
              currentPrice: true,
            },
            with: {
              size: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: desc(OrderItemTable.createdAt),
      });
    }

    return orders;
  } catch (err) {
    return [];
  }
};

export const getAdminOrdersByStatus = async ({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) => {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!user || !user.id || user.role !== userRoles[1]) {
      return [];
    }

    let orders = [];

    if (status && status !== "all") {
      orders = await db.query.OrderTable.findMany({
        where: eq(OrderTable.status, getOrderStatusValue(status)),
        with: {
          orderItems: {
            with: {
              product: {
                columns: { name: true },
              },
              productItem: {
                columns: {
                  images: true,
                },
              },
              availableItem: {
                columns: {
                  currentPrice: true,
                },
                with: {
                  size: true,
                },
              },
            },
          },
        },
        orderBy: desc(OrderTable.createdAt),
      });
    } else {
      orders = await db.query.OrderTable.findMany({
        with: {
          orderItems: {
            with: {
              product: {
                columns: { name: true },
              },
              productItem: {
                columns: {
                  images: true,
                },
              },
              availableItem: {
                columns: {
                  currentPrice: true,
                },
                with: {
                  size: true,
                },
              },
            },
          },
        },
        orderBy: desc(OrderTable.createdAt),
      });
    }

    return orders;
  } catch (err) {
    return [];
  }
};
