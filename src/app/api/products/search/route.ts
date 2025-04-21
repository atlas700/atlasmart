import { z } from "zod";
import prismadb from "@/lib/prisma";
import { HomeProductType } from "@/types";
import { NextResponse } from "next/server";
import { SearchBodySchema } from "@/lib/validators/search-body";

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

    const { category, minPrice, maxPrice, minDiscount, maxDiscount } =
      validatedBody;

    let whereQuery: any = {
      status: "APPROVED",
      OR: [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: q,
              mode: "insensitive",
            },
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
    };

    if (category !== "") {
      whereQuery.category = {
        name: {
          equals: category,
          mode: "insensitive",
        },
      };
    }

    if (minPrice && minPrice !== "" && maxPrice && maxPrice !== "") {
      whereQuery.productItems.some.availableItems.some.currentPrice = {
        gte: +minPrice,
        lte: +maxPrice,
      };
    }

    if (
      minDiscount &&
      minDiscount !== "" &&
      maxDiscount &&
      maxDiscount !== ""
    ) {
      whereQuery.productItems.some.discount = {
        gte: +minDiscount,
        lte: +maxDiscount,
      };
    }

    const totalCount = await prismadb.product.count({
      where: whereQuery,
    });

    const products = await prismadb.product.findMany({
      where: whereQuery,
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

    return NextResponse.json({
      products,
      hasMore:
        products.length === parseInt(limit) &&
        parseInt(page) * parseInt(limit) < totalCount,
    });
  } catch (err) {
    console.error("GET_SEARCHED_PRODUCTS", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
