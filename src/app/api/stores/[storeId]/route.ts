import { db } from "@/drizzle/db";
import {
  CategoryTable,
  ColorTable,
  ProductTable,
  SizeTable,
  StoreTable,
  userRoles,
} from "@/drizzle/schema";
import { StoreSettingsSchema } from "@/lib/validators/storeSettings";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { postcodeValidator } from "postcode-validator";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== userRoles[2]) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    const body = await request.json();

    let validatedBody;

    try {
      validatedBody = StoreSettingsSchema.parse(body);
    } catch (err) {
      return NextResponse.json("Invalid Credentials", { status: 400 });
    }

    const { name, country, postcode, description, logo } = validatedBody;

    //Check if postcode is valid
    const locationIsValid = postcodeValidator(postcode, country);

    if (!locationIsValid) {
      return new NextResponse("Invalid postcode!", { status: 400 });
    }

    await db
      .update(StoreTable)
      .set({
        name,
        country,
        postCode: postcode,
        description,
        logo,
      })
      .where(and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)));

    return NextResponse.json({ message: "Store Updated!" });
  } catch (err) {
    console.log("[STORE_UPDATE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    //Check if there is a current user
    const { user } = await getCurrentUser({ allData: true });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if user is a seller
    if (user.role !== userRoles[2]) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //Check if the user owns the store
    const store = await db.query.StoreTable.findFirst({
      where: and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)),
    });

    if (!store) {
      return new NextResponse("Store not found!", { status: 404 });
    }

    //Delete all categories
    await db.delete(CategoryTable).where(eq(CategoryTable.storeId, storeId));

    //Delete all colors
    await db.delete(ColorTable).where(eq(ColorTable.storeId, storeId));

    //Delete all sizes
    await db.delete(SizeTable).where(eq(SizeTable.storeId, storeId));

    //Delete all Product
    await db.delete(ProductTable).where(eq(ProductTable.storeId, storeId));

    //Delete Store
    await db
      .delete(StoreTable)
      .where(and(eq(StoreTable.id, storeId), eq(StoreTable.userId, user.id)));

    return NextResponse.json({ message: "Store Deleted!" });
  } catch (err) {
    console.log("[STORE_DELETE]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
