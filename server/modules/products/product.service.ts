import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import {
  products,
  productVariants,
  inventoryItems,
  stores,
  users,
  orders,
  orderLines,
} from "@shared/schema";
import {
  CreateProductWithVariants,
  ProductVariant,
  UpdateProductWithVariants,
} from "@shared/product.type";
import { db } from "server/db";
import { BuyProductInput } from "@shared/payment.type";
import { stripe } from "server/stripe";

export const productService = {
  // ------------------------
  // Create Product with Variants + Inventory in one transaction
  // ------------------------
  createProductWithVariants: async (data: CreateProductWithVariants) => {
    return db.transaction(async (tx) => {
      // Create product
      const [product] = await tx
        .insert(products)
        .values({
          storeId: data.storeId,
          title: data.title,
          description: data.description,
          images: data.images || [],
          published: data.published || false,
        })
        .returning();

      // Create variants + inventory
      const variantRecords = data.variants.map((v) => ({
        ...v,
        productId: product.id,
      }));

      const createdVariants = await tx
        .insert(productVariants)
        .values(variantRecords)
        .returning();

      // Create inventory items
      const inventoryRecords = createdVariants.map((v, i) => ({
        variantId: v.id,
        stockQuantity: data.variants[i].stockQuantity || 0,
        reservedQuantity: 0,
      }));

      await tx.insert(inventoryItems).values(inventoryRecords);

      return {
        ...product,
        variants: createdVariants,
        inventory: inventoryRecords,
      };
    });
  },
  // ------------------------
  // Update product
  // ------------------------
  updateProductWithVariants: async (
    id: string,
    data: UpdateProductWithVariants
  ) => {
    return db.transaction(async (tx) => {
      // 1. Update product
      const [updatedProduct] = await tx
        .update(products)
        .set({
          ...data,
          images: data.images ? sql`${JSON.stringify(data.images)}` : undefined,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(products.id, id))
        .returning();

      // 2. Update or insert variants
      const variants = data.variants || [];
      const variantRecords: ProductVariant[] = [];

      for (const v of variants) {
        if (v.id) {
          // existing variant -> update
          const updateData: Partial<ProductVariant> = {};

          if (v.title !== undefined) updateData.title = v.title;
          if (v.sku !== undefined) updateData.sku = v.sku;
          if (v.price !== undefined) updateData.price = v.price;
          updateData.updatedAt = new Date();

          const [updatedVariant] = await tx
            .update(productVariants)
            .set(updateData)
            .where(eq(productVariants.id, v.id))
            .returning();

          variantRecords.push(updatedVariant);
        } else {
          // new variant -> insert
          const { title, sku, price } = v;

          if (!title || !sku || price === undefined) {
            throw new Error("Missing required variant fields");
          }

          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId: id,
              title,
              sku,
              price,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .returning();

          variantRecords.push(newVariant);
        }
      }

      // 3. Update inventory
      for (let i = 0; i < variantRecords.length; i++) {
        const v = variantRecords[i];
        const inventoryData = variants[i];

        const existingInventory = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.variantId, v.id))
          .execute();

        if (existingInventory.length > 0) {
          await tx
            .update(inventoryItems)
            .set({
              stockQuantity: inventoryData.stockQuantity ?? 0,
              reservedQuantity: inventoryData.reservedQuantity ?? 0,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(inventoryItems.variantId, v.id));
        } else {
          await tx.insert(inventoryItems).values({
            variantId: v.id,
            stockQuantity: inventoryData.stockQuantity ?? 0,
            reservedQuantity: inventoryData.reservedQuantity ?? 0,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          });
        }
      }

      // 4. Return full product with variants
      return {
        ...updatedProduct,
        variants: variantRecords.map((v, i) => ({
          ...v,
          stockQuantity: variants[i].stockQuantity ?? 0,
          reservedQuantity: variants[i].reservedQuantity ?? 0,
        })),
      };
    });
  },
  // Get product with variants & inventory
  getProductWithVariants: async (id: string) => {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) return null;

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));

    if (!variants.length) return { ...product, variants: [] };

    const variantIds = variants.map((v) => v.id);

    const inventory = await db
      .select()
      .from(inventoryItems)
      .where(inArray(inventoryItems.variantId, variantIds));

    // Map inventory by variantId for fast lookup
    const inventoryMap = Object.fromEntries(
      inventory.map((inv) => [inv.variantId, inv])
    );

    // Merge inventory data into variants
    const variantsWithInventory = variants.map((v) => ({
      ...v,
      stockQuantity: inventoryMap[v.id]?.stockQuantity ?? 0,
      reservedQuantity: inventoryMap[v.id]?.reservedQuantity ?? 0,
    }));

    return { ...product, variants: variantsWithInventory };
  },

  getProductsByStore: async (
    storeId: string,
    limit = 20,
    offset = 0,
    searchQuery = ""
  ) => {
    const maxLimit = Math.min(limit, 100); // cap limit to 100

    // ------------------- Count total matching products -------------------
    const totalRowCount = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          searchQuery
            ? or(
                ilike(products.title, `%${searchQuery}%`),
                ilike(products.description, `%${searchQuery}%`)
              )
            : undefined
        )
      );

    const totalCount = Number(totalRowCount[0]?.count ?? 0);

    // ------------------- STEP 1: Fetch product IDs (real pagination) -------------------
    const productIdRows = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          searchQuery
            ? or(
                ilike(products.title, `%${searchQuery}%`),
                ilike(products.description, `%${searchQuery}%`)
              )
            : undefined
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(maxLimit)
      .offset(offset);

    const productIds = productIdRows.map((p) => p.id);

    if (productIds.length === 0) {
      return { products: [], totalCount };
    }

    // ------------------- STEP 2: Fetch products + variants -------------------
    const rows = await db
      .select({
        product: products,
        variant: productVariants,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(inArray(products.id, productIds))
      .orderBy(desc(products.updatedAt));

    // ------------------- Group variants -------------------
    const map = new Map<string, any>();

    for (const row of rows) {
      const product = row.product;
      const variant = row.variant;

      if (!map.has(product.id)) {
        map.set(product.id, { ...product, variants: [] });
      }

      if (variant?.id) {
        map.get(product.id).variants.push(variant);
      }
    }

    const productsWithVariants = Array.from(map.values());

    return { products: productsWithVariants, totalCount };
  },

  deleteProduct: async (id: string) => {
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  },

  buyProduct: async (userId: string | undefined, data: BuyProductInput) => {
    return db.transaction(async (tx) => {
      // 1. Store + artist
      const [store] = await tx
        .select()
        .from(stores)
        .where(eq(stores.id, data.storeId));

      if (!store) throw new Error("Store not found");

      if (userId && store.userId === userId) {
        throw new Error("Artists cannot purchase their own products");
      }

      const [artist] = await tx
        .select()
        .from(users)
        .where(eq(users.id, store.userId));

      if (!artist?.stripeAccountId || !artist.stripeChargesEnabled) {
        throw new Error("Artist cannot accept payments");
      }

      // 2. Variants
      const variantIds = data.items.map((i) => i.variantId);

      const variants = await tx
        .select()
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds));

      if (variants.length !== variantIds.length) {
        throw new Error("Invalid product variants");
      }

      // 3. Inventory + total
      let totalAmount = 0;

      for (const item of data.items) {
        const variant = variants.find((v) => v.id === item.variantId)!;

        const [inventory] = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.variantId, variant.id));

        if (!inventory || inventory.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.title}`);
        }

        totalAmount += variant.price * item.quantity;
      }

      // 4. Order
      const [order] = await tx
        .insert(orders)
        .values({
          storeId: data.storeId,
          buyerId: userId,
          totalAmount,
          currency: "GBP",
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
        })
        .returning();

      // 5. Order lines
      await tx.insert(orderLines).values(
        data.items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            orderId: order.id,
            variantId: variant.id,
            quantity: item.quantity,
            unitPrice: variant.price,
            lineTotal: variant.price * item.quantity,
          };
        })
      );

      // 6. PaymentIntent (DESTINATION CHARGE)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
        on_behalf_of: artist.stripeAccountId, // ✅ charge settles in artist's country
        metadata: {
          orderId: order.id,
          storeId: store.id,
          artistId: artist.id,
        },
      });

      // 7. Persist PI
      await tx
        .update(orders)
        .set({ stripePaymentIntentId: paymentIntent.id })
        .where(eq(orders.id, order.id));

      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret!,
      };
    });
  },
};
