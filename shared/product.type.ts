import { createInsertSchema } from "drizzle-zod";
import { products, productVariants, inventoryItems } from "@shared/schema";
import { z } from "zod";

// ------------------------
// Product
// ------------------------
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial();

// ------------------------
// Variant + Inventory
// ------------------------
export const variantWithInventorySchema = z.object({
  sku: z.string(),
  title: z.string(),
  price: z.number().int(),
  stockQuantity: z.number().int().default(0),
});

// For update: all fields optional, allow id for existing variant
export const updateVariantWithInventorySchema = variantWithInventorySchema
  .partial()
  .extend({
    id: z.string().optional(),
    reservedQuantity: z.number().int().optional(),
  });

// ------------------------
// One-shot Product Creation
// ------------------------
export const createProductWithVariantsSchema = insertProductSchema.extend({
  variants: z.array(variantWithInventorySchema).nonempty(),
});

// For updating product + variants
export const updateProductWithVariantsSchema = updateProductSchema.extend({
  variants: z.array(updateVariantWithInventorySchema).optional(),
});

// ------------------------
// Types
// ------------------------
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type VariantWithInventory = z.infer<typeof variantWithInventorySchema>;

export type CreateProductWithVariants = z.infer<
  typeof createProductWithVariantsSchema
>;
export type UpdateProductWithVariants = z.infer<
  typeof updateProductWithVariantsSchema
>;

export type ProductVariantWithInventory = ProductVariant & {
  stockQuantity: number;
  reservedQuantity: number;
};

export type ProductWithVariants = Product & {
  variants: ProductVariantWithInventory[];
};
