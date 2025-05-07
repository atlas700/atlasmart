"use server";

import { db } from "@/drizzle/db";
import { UserRole, UserTable } from "@/drizzle/schema";
import { and, eq, ne } from "drizzle-orm";

export async function insertUser(data: typeof UserTable.$inferInsert) {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.clerkUserId],
      set: data,
    });

  if (newUser == null) throw new Error("Failed to create user");

  return newUser;
}

export async function updateUser(
  { clerkUserId }: { clerkUserId: string },
  data: Partial<typeof UserTable.$inferInsert>
) {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (updatedUser == null) throw new Error("Failed to update user");

  return updatedUser;
}

export async function deleteUser({ clerkUserId }: { clerkUserId: string }) {
  const [deletedUser] = await db
    .delete(UserTable)
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (deletedUser == null) throw new Error("Failed to delete user");

  return deletedUser;
}

export const getUserById = async (id: string) => {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, id),
    });

    return user;
  } catch (err) {
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.email, email),
    });

    return user;
  } catch (err) {
    return null;
  }
};

export const getUsersByAdmin = async ({
  userId,
  userRole,
}: {
  userId?: string;
  userRole?: UserRole;
}) => {
  try {
    if (!userId || !userRole || userRole !== "ADMIN") {
      return [];
    }

    const users = await db.query.UserTable.findMany({
      where: and(ne(UserTable.id, userId), ne(UserTable.role, "ADMIN")),
    });

    return users;
  } catch (err) {
    return [];
  }
};
