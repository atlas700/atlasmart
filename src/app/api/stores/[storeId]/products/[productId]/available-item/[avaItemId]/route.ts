import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole, storeStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: { storeId: string; productId: string; avaItemId: string } }
) {
  try {
    const { storeId, productId, avaItemId } = params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!avaItemId) {
      return new NextResponse("Available Item Id is required", { status: 400 });
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

    //Check if store has been approved
    if (store.status !== storeStatus.APPROVED) {
      return new NextResponse("Unauthorized, Store not approved yet!", {
        status: 401,
      });
    }

    //check if product item exists
    const itemExist = await prismadb.available.findUnique({
      where: {
        id: avaItemId,
        productId,
      },
    });

    if (!itemExist) {
      return new NextResponse("Item not found!", {
        status: 404,
      });
    }

    //Delete Product Item
    await prismadb.available.delete({
      where: {
        id: avaItemId,
        productId,
      },
    });

    return NextResponse.json({ message: "Item Deleted!" });
  } catch (err) {
    console.log("[AVAILABLE_ITEM_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
