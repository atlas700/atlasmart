import prismadb from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole, storeStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";

export async function PATCH(
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

    //Check if store has been approved
    if (store.status !== storeStatus.APPROVED) {
      return new NextResponse(
        "Unauthorized, store needs to be approved before you can close it!",
        { status: 404 }
      );
    }

    //Archived all products that belongs to that store.
    await prismadb.product.updateMany({
      where: {
        storeId,
        userId: user.id,
      },
      data: {
        status: "ARCHIVED",
        statusFeedback:
          "Your product has been archived. It will not longer be visible to the customers. To change this open your store from your settings",
      },
    });

    await prismadb.store.update({
      where: {
        id: storeId,
        userId: user.id,
      },
      data: {
        status: "CLOSED",
        statusFeedback:
          "Your store has been closed and products belonging to this store is now invisible to customers. If you change your mind, you can reopen your store at any time from your settings.",
      },
    });

    return NextResponse.json({ message: "Store Closed!" });
  } catch (err) {
    console.log("[STORE_CLOSED]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
