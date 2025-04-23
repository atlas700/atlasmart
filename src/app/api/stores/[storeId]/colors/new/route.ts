import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ColorSchema } from "@/lib/validators/color";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { checkText } from "@/actions/checkText";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
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
          "The name of your category is inappropiate! Change it.",
          {
            status: 400,
          }
        );
      }
    }

    //Check if category name exists
    const color = await prismadb.color.findFirst({
      where: {
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

    await prismadb.color.create({
      data: {
        name,
        value,
        storeId,
      },
    });

    return NextResponse.json({ message: "Color Created!" });
  } catch (err) {
    console.log("[COLOR_CREATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
