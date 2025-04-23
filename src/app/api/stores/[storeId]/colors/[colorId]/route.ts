import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ColorSchema } from "@/lib/validators/color";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { checkText } from "@/actions/checkText";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { storeId, colorId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color Id is required", { status: 400 });
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

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = ColorSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, value } = validatedBody;

    if (process.env.VERCEL_ENV === "production") {
      //Check if name is appropiate
      const nameIsAppropiate = await checkText({ text: name });

      if (
        nameIsAppropiate.success === "NEGATIVE" ||
        nameIsAppropiate.success === "MIXED" ||
        nameIsAppropiate.error
      ) {
        return new NextResponse(
          "The name of your color is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }
    }

    //Check if category name exists
    const color = await prismadb.color.findFirst({
      where: {
        id: {
          not: colorId,
        },
        storeId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (color) {
      return new NextResponse(`${name} already taken!`, { status: 409 });
    }

    await prismadb.color.update({
      where: {
        id: colorId,
        storeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json({ message: "Color Updated!" });
  } catch (err) {
    console.log("[COLOR_UPDATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { storeId, colorId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color Id is required", { status: 400 });
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

    await prismadb.color.delete({
      where: {
        id: colorId,
        storeId,
      },
    });

    return NextResponse.json({ message: "Color Deleted!" });
  } catch (err) {
    console.log("[COLOR_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
