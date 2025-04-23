import { z } from "zod";
import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
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

    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //check if store exists
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    let products = [];

    if (q && q.trim() !== "") {
      products = await prismadb.product.findMany({
        where: {
          storeId,
          status: "APPROVED",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { name: { equals: q, mode: "insensitive" } },
            {
              category: {
                name: { contains: q, mode: "insensitive" },
              },
            },
            {
              category: {
                name: { equals: q, mode: "insensitive" },
              },
            },
          ],
          productItems: {
            some: {
              availableItems: {
                some: {
                  numInStocks: {
                    gt: 0,
                  },
                },
              },
            },
          },
        },
        include: {
          category: true,
          productItems: {
            where: {
              availableItems: {
                some: {
                  numInStocks: {
                    gt: 0,
                  },
                },
              },
            },
            include: {
              availableItems: {
                include: {
                  size: true,
                },
              },
            },
          },
          reviews: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
      });
    } else {
      products = await prismadb.product.findMany({
        where: {
          storeId,
          status: "APPROVED",
          productItems: {
            some: {
              availableItems: {
                some: {
                  numInStocks: {
                    gt: 0,
                  },
                },
              },
            },
          },
        },
        include: {
          category: true,
          productItems: {
            where: {
              availableItems: {
                some: {
                  numInStocks: {
                    gt: 0,
                  },
                },
              },
            },
            include: {
              availableItems: {
                include: {
                  size: true,
                },
              },
            },
          },
          reviews: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
      });
    }

    return NextResponse.json(products);
  } catch (err) {
    console.log("GET_STORE_PRODUCTS", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
