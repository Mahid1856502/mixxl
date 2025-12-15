import { eq } from "drizzle-orm";
import { orders, orderLines, productVariants, products } from "@shared/schema";
import { db } from "server/db";

export const orderService = {
  getOrderById: async (id: string) => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    const orderResult = isUUID
      ? await db.select().from(orders).where(eq(orders.id, id)).limit(1)
      : await db
          .select()
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, id))
          .limit(1);

    const order = orderResult[0];
    if (!order) throw new Error("Order not found");

    const items = await db
      .select({
        id: orderLines.id,
        quantity: orderLines.quantity,
        unitPrice: orderLines.unitPrice,
        lineTotal: orderLines.lineTotal,

        variant: {
          id: productVariants.id,
          title: productVariants.title,
          sku: productVariants.sku,
          price: productVariants.price,
        },

        product: {
          id: products.id,
          title: products.title,
          images: products.images,
        },
      })
      .from(orderLines)
      .innerJoin(productVariants, eq(orderLines.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(orderLines.orderId, order.id));

    return {
      ...order,
      items,
    };
  },
};
