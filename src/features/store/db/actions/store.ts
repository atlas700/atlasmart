"use server";

import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { postcodeValidator } from "postcode-validator";
import { generateStoreVerificationToken } from "@/lib/token";
import { StoreValidator, StoreSchema } from "@/lib/validators/store";
import { getStoreVerificationTokenByEmail } from "@/data/store-verification-token";
import {
  sendCreatedStoreEmail,
  sendStoreVerificationTokenEmail,
} from "@/lib/mail";
import { checkText } from "./checkText";
import { getCurrentUser } from "@/services/clerk";

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

  const dbUser = await prismadb.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return { error: "Unauthorized!" };
  }

  const validatedFields = StoreSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, country, postcode, code } = validatedFields.data;

  if (process.env.VERCEL_ENV === "production") {
    //Check if name and desctiption are appropiate
    const nameIsAppropiate = await checkText({ text: name });

    if (
      nameIsAppropiate.success === "NEGATIVE" ||
      nameIsAppropiate.success === "MIXED" ||
      nameIsAppropiate.error
    ) {
      return { error: "The name of your store is inappropiate! Change it" };
    }
  }

  // Check if postcode is valid
  const locationIsValid = postcodeValidator(postcode, country);

  if (!locationIsValid) {
    return { error: "Invalid postcode!" };
  }

  //Check if a store has used the email
  const storeExists = await prismadb.store.findUnique({
    where: {
      email_name: {
        email,
        name,
      },
    },
  });

  if (!storeExists) {
    //Check if user has up to five stores
    const userStores = await prismadb.store.findMany({
      where: {
        userId: user.id,
      },
    });

    if (userStores.length >= 5) {
      return { error: "Sellers can't have more than 5 stores!" };
    }

    //Create Store
    const store = await prismadb.store.create({
      data: {
        userId: dbUser.id,
        name,
        email,
        country,
        postcode,
      },
    });

    //Generate verification code
    const storeVerificationToken = await generateStoreVerificationToken(
      store.email
    );

    //Send generated code
    await sendStoreVerificationTokenEmail({
      email: storeVerificationToken.email,
      token: storeVerificationToken.token,
    });

    return { verificationCode: true };
  } else {
    if (code && storeExists?.email) {
      //Check it two factor token exists
      const storeVerificationToken = await getStoreVerificationTokenByEmail(
        email
      );

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
      await prismadb.storeVerificationToken.delete({
        where: {
          id: storeVerificationToken.id,
        },
      });

      //Verify email address
      const store = await prismadb.store.update({
        where: {
          id: storeExists.id,
          email: storeExists.email,
        },
        data: {
          emailVerified: new Date(),
        },
      });

      //Change current user to seller
      const storeUser = await prismadb.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          role: "SELLER",
        },
      });

      //Send email notification
      await sendCreatedStoreEmail({
        email: storeUser?.email || "",
        storeName: store.name,
        description: store.description || "",
        storeEmail: store.email,
        ownerName: storeUser.name || "",
      });

      await sendCreatedStoreEmail({
        email: store.email || "",
        storeName: store.name,
        description: store.description || "",
        storeEmail: store.email,
        ownerName: storeUser.name || "",
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
