import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SizeSchema } from "@/lib/validators/size";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { checkText } from "@/actions/checkText";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { storeId, sizeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size Id is required", { status: 400 });
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
      validatedBody = SizeSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, value } = validatedBody;

    if (process.env.VERCEL_ENV === "production") {
      //Check if name and value are appropiate
      const nameIsAppropiate = await checkText({ text: name });

      if (
        nameIsAppropiate.success === "NEGATIVE" ||
        nameIsAppropiate.success === "MIXED" ||
        nameIsAppropiate.error
      ) {
        return new NextResponse(
          "The name of your size is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }

      const valueIsAppropiate = await checkText({ text: value });

      if (
        valueIsAppropiate.success === "NEGATIVE" ||
        valueIsAppropiate.success === "MIXED" ||
        valueIsAppropiate.error
      ) {
        return new NextResponse(
          "The value of your size is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }
    }

    //Check if category name exists
    const size = await prismadb.size.findFirst({
      where: {
        id: {
          not: sizeId,
        },
        storeId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (size) {
      return new NextResponse("Name already taken!", { status: 409 });
    }

    await prismadb.size.update({
      where: {
        id: sizeId,
        storeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json({ messsage: "Size Updated!" });
  } catch (err) {
    console.log("[SIZE_UPDATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { storeId, sizeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size Id is required", { status: 400 });
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

    await prismadb.size.delete({
      where: {
        id: sizeId,
        storeId,
      },
    });

    return NextResponse.json({ message: "Size Deleted!" });
  } catch (err) {
    console.log("[SIZE_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
