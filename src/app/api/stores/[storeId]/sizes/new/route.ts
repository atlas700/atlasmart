import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SizeSchema } from "@/lib/validators/size";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

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
      validatedBody = SizeSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, value } = validatedBody;

    //Check if category name exists
    const size = await prismadb.size.findFirst({
      where: {
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

    await prismadb.size.create({
      data: {
        name,
        value,
        storeId,
      },
    });

    return NextResponse.json({ message: "Size Created!" });
  } catch (err) {
    console.log("[SIZE_CREATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
