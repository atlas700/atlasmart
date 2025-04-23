import prismadb from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { checkText } from "@/actions/checkText";
import { currentUser } from "@/lib/auth";
import { CategorySchema } from "@/lib/validators/category";

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
      validatedBody = CategorySchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name } = validatedBody;

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
    const category = await prismadb.category.findFirst({
      where: {
        storeId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (category) {
      return new NextResponse("Name already taken!", { status: 409 });
    }

    await prismadb.category.create({
      data: {
        name,
        storeId,
      },
    });

    return NextResponse.json({ message: "Category Created!" });
  } catch (err) {
    console.log("[CATEGORY_CREATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
