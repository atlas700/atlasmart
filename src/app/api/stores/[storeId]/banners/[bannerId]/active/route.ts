import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiRatelimit } from "@/lib/redis";
import { currentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; bannerId: string } }
) {
  try {
    const { storeId, bannerId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!bannerId) {
      return new NextResponse("Banner Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller

    if (user.role !== UserRole.SELLER) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = await apiRatelimit.limit(user.id);

    if (!success && process.env.VERCEL_ENV === "production") {
      return NextResponse.json("Too Many Requests! try again in 1 min", {
        status: 429,
      });
    }

    //Check if the user owns the store
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    //Check if banner exists
    const banner = await prismadb.banner.findUnique({
      where: {
        id: bannerId,
        storeId,
      },
    });

    if (!banner) {
      return new NextResponse("Banner not found!", { status: 404 });
    }

    //Set current banner status to active
    await prismadb.banner.update({
      where: {
        id: bannerId,
      },
      data: {
        active: true,
      },
    });

    //Set other banners status to not active
    await prismadb.banner.updateMany({
      where: {
        storeId,
        id: {
          not: bannerId,
        },
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ message: "Banner has been set to active!" });
  } catch (err) {
    console.log("[BANNER_UPDATE_ACTIVE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
