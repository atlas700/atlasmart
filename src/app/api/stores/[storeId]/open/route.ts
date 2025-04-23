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

    //Check if store has been closed
    if (store.status !== storeStatus.CLOSED) {
      return new NextResponse("Unauthorized, store is not closed!", {
        status: 404,
      });
    }

    //UnArchived all products that belongs to that store.
    await prismadb.product.updateMany({
      where: {
        storeId,
        userId: user.id,
      },
      data: {
        status: "APPROVED",
        statusFeedback:
          "Welcome back, Your product has been approved. It will be shown to potential customers.",
      },
    });

    await prismadb.store.update({
      where: {
        id: storeId,
        userId: user.id,
      },
      data: {
        status: "APPROVED",
        statusFeedback: "Welcome back, Your store has been approved.",
      },
    });

    return NextResponse.json({ message: "Store Opened!" });
  } catch (err) {
    console.log("[STORE_OPENED]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
