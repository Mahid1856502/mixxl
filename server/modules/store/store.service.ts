// store.service.ts
import { eq } from "drizzle-orm";
import { stores } from "@shared/schema";
import { db } from "server/db";
import { InsertStore, UpdateStore } from "@shared/store.type";

// 1️⃣ Create a store (Setup Store)
export async function setupStore(data: InsertStore) {
  // Ensure user does not already have a store
  const existing = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, data.userId));

  if (existing.length > 0) {
    throw new Error("User already has a store.");
  }

  const result = await db.insert(stores).values(data).returning();
  return result[0];
}

// 2️⃣ Update existing store
export async function updateStore(storeId: string, data: UpdateStore) {
  const result = await db
    .update(stores)
    .set(data)
    .where(eq(stores.id, storeId))
    .returning();

  return result[0];
}

// Optional convenience: Get store by user
export async function getStoreByUser(userId: string) {
  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, userId));

  return result[0] ?? null;
}
