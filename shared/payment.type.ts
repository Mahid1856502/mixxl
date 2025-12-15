// shared/payment.type.ts
import { z } from "zod";

export const buyProductSchema = z.object({
  storeId: z.string().uuid(),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  shippingAddress: z.any().optional(),
  billingAddress: z.any().optional(),
});

export type BuyProductInput = z.infer<typeof buyProductSchema>;
