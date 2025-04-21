import { db } from "@/drizzle/db";
import { StoreVerificationTokenTable } from "@/drizzle/schema";
import { getStoreVerificationTokenByEmail } from "@/features/store/db/store";
import crypto from "crypto";
import { eq } from "drizzle-orm";

export const generateStoreVerificationToken = async (email: string) => {
  //Generate random 6 digits
  const token = crypto.randomInt(100_000, 1_000_000).toString();

  //This is expiring in 5 min.
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  //Check if there is an existing verification token for this email.
  const existingToken = await getStoreVerificationTokenByEmail(email);

  //Delete existing token
  if (existingToken) {
    await db
      .delete(StoreVerificationTokenTable)
      .where(eq(StoreVerificationTokenTable.id, existingToken.id));
  }

  //Create a new token.
  const [storeVerificationToken] = await db
    .insert(StoreVerificationTokenTable)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return storeVerificationToken;
};
