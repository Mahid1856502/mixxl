// store.schemas.ts
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { stores } from "@shared/schema";

// Insert: everything except auto fields
export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStoreSchema = insertStoreSchema.partial();

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
