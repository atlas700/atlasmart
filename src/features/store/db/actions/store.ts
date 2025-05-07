"use server";

import { generateStoreVerificationToken } from "@/lib/token";
import { StoreSchema, StoreValidator } from "@/lib/validators/store";
import { getCurrentUser, syncClerkUserMetadata } from "@/services/clerk";
import { postcodeValidator } from "postcode-validator";
import { getStoreVerificationTokenByEmail } from "../store";

import { db } from "@/drizzle/db";
import {
  StoreTable,
  StoreVerificationTokenTable,
  UserTable,
} from "@/drizzle/schema";
import {
  sendCreatedStoreEmail,
  sendStoreVerificationTokenEmail,
} from "@/lib/mail";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { and, eq } from "drizzle-orm";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "5 m"),
});

export const createStore = async (values: StoreValidator) => {
  const { user } = await getCurrentUser({ allData: true });

  if (!user || !user.id) {
    return { error: "Unauthorized!" };
  }

  const { success } = await ratelimit.limit(user.id);

  if (!success && process.env.VERCEL_ENV === "production") {
    return { error: "Too Many Requests! try again in 5 min" };
  }

  const dbUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, user.id),
  });

  if (!dbUser) {
    return { error: "Unauthorized!" };
  }

  const validatedFields = StoreSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, country, postcode, code } = validatedFields.data;

  // Check if postcode is valid
  const locationIsValid = postcodeValidator(postcode, country);

  if (!locationIsValid) {
    return { error: "Invalid postcode!" };
  }

  //Check if a store has used the email
  const storeExists = await db.query.StoreTable.findFirst({
    where: and(eq(StoreTable.email, email), eq(StoreTable.name, name)),
  });

  if (!storeExists) {
    //Check if user has up to five stores
    const userStores = await db.query.StoreTable.findMany({
      where: eq(StoreTable.userId, user.id),
    });

    if (userStores.length >= 5) {
      return { error: "Sellers can't have more than 5 stores!" };
    }

    //Create Store
    const [store] = await db
      .insert(StoreTable)
      .values({
        userId: dbUser.id,
        name,
        email,
        country,
        postCode: postcode,
      })
      .returning();

    //Generate verification code
    const storeVerificationToken = await generateStoreVerificationToken(
      store!.email
    );

    //Send generated code
    await sendStoreVerificationTokenEmail({
      email: storeVerificationToken!.email,
      token: storeVerificationToken!.token,
    });

    return { verificationCode: true };
  } else {
    if (code && storeExists?.email) {
      //Check it two factor token exists
      const storeVerificationToken =
        await getStoreVerificationTokenByEmail(email);

      if (!storeVerificationToken) {
        return { error: "Invalid code!" };
      }

      //Check if token === code
      if (storeVerificationToken.token !== code) {
        return { error: "Invalid code!" };
      }

      //Check if token has expired
      const hasExpired = new Date(storeVerificationToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      //Delete Token
      await db
        .delete(StoreVerificationTokenTable)
        .where(eq(StoreVerificationTokenTable.id, storeVerificationToken.id));

      const [store] = await db
        .update(StoreTable)
        .set({
          emailVerified: new Date(),
        })
        .where(
          and(
            eq(StoreTable.id, storeExists.id),
            eq(StoreTable.email, storeExists.email)
          )
        )
        .returning();

      //Change current user to seller
      const [storeUser] = await db
        .update(UserTable)
        .set({
          role: "SELLER",
        })
        .where(and(eq(UserTable.id, dbUser.id)))
        .returning();

      await syncClerkUserMetadata({
        clerkUserId: user.clerkUserId,
        id: user.id,
        role: "SELLER",
      });

      //Send email notification
      await sendCreatedStoreEmail({
        email: storeUser?.email || "",
        storeName: store!.name,
        description: store!.description || "",
        storeEmail: store!.email,
        ownerName: storeUser!.name || "",
      });

      await sendCreatedStoreEmail({
        email: store!.email || "",
        storeName: store!.name,
        description: store!.description || "",
        storeEmail: store!.email,
        ownerName: storeUser!.name || "",
      });

      return {
        success:
          "Email verified, your store has been created. Please wait redirecting to store...",
        storeId: storeExists.id,
      };
    } else {
      return { error: "Store Already Exists!" };
    }
  }
};
