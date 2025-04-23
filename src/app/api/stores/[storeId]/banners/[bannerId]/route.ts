import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiRatelimit } from "@/lib/redis";
import { currentUser } from "@/lib/auth";
import { BannerSchema } from "@/lib/validators/banner";
import { checkText } from "@/actions/checkText";
import { checkImage } from "@/actions/checkImage";

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

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = BannerSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, image } = validatedBody;

    if (process.env.VERCEL_ENV === "production") {
      //Check if name and desctiption are appropiate
      const nameIsAppropiate = await checkText({ text: name });

      if (
        nameIsAppropiate.success === "NEGATIVE" ||
        nameIsAppropiate.success === "MIXED" ||
        nameIsAppropiate.error
      ) {
        return new NextResponse(
          "The name of your banner is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }

      //Check if images are appropiate
      const imgIsAppropiate = await checkImage({ imageUrl: image });

      if (!imgIsAppropiate.isAppropiate || imgIsAppropiate.error) {
        return new NextResponse(
          "The image of your banner is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }
    }

    //Check if banner name exists
    const banner = await prismadb.category.findFirst({
      where: {
        id: {
          not: bannerId,
        },
        storeId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (banner) {
      return new NextResponse("Name already taken!", { status: 409 });
    }

    await prismadb.banner.update({
      where: {
        id: bannerId,
      },
      data: {
        name,
        image,
      },
    });

    return NextResponse.json({ message: "Banner Updated!" });
  } catch (err) {
    console.log("[BANNER_UPDATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
    const banner = await prismadb.banner.findFirst({
      where: {
        id: bannerId,
        storeId,
      },
    });

    if (!banner) {
      return new NextResponse("Banner not found!", { status: 404 });
    }

    await prismadb.banner.delete({
      where: {
        id: bannerId,
      },
    });

    return NextResponse.json({ message: "Banner Deleted!" });
  } catch (err) {
    console.log("[BANNER_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
