// product.route.ts

import { User } from "@shared/schema";
import * as storeService from "../store/store.service";
import type { Express, NextFunction, Request, Response } from "express";
import {
  createProductWithVariantsSchema,
  updateProductWithVariantsSchema,
} from "@shared/product.type";
import { productService } from "./product.service";
import { authenticate } from "server/admin-routes";
import { Store } from "@shared/store.type";

declare global {
  namespace Express {
    export interface Request {
      user: User;
      store: Store;
    }
  }
}

export const requireStoreOwner = async (req: any, res: any, next: any) => {
  await authenticate(req, res, async () => {
    // Check that user role is store_owner
    if (req.user.role !== "artist") {
      return res.status(403).json({ error: "Store owner access required" });
    }

    // Fetch the user's store
    const store = await storeService.getStoreByUser(req.user.id);
    if (!store) {
      return res.status(403).json({ error: "Store not found for this user" });
    }

    req.store = store; // attach store to request
    next();
  });
};

export const verifyStoreOwnership = async (req: any, res: any, next: any) => {
  const requestedStoreId = req.body.storeId;

  if (requestedStoreId !== req.store.id) {
    return res
      .status(403)
      .json({ error: "You do not have access to this product" });
  }
  next();
};

export const verifyProductOwnership = async (req: any, res: any, next: any) => {
  const productId = req.params.id;
  if (!productId)
    return res.status(400).json({ error: "Product ID is required" });

  const product = await productService.getProductWithVariants(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (product.storeId !== req.store.id) {
    return res
      .status(403)
      .json({ error: "You do not have access to this product" });
  }

  req.product = product; // optional: attach product to request
  next();
};

export function registerProductRoutes(app: Express) {
  // ------------------------
  // Create Product with Variants + Inventory
  // ------------------------
  app.post(
    "/api/product",
    authenticate,
    requireStoreOwner,
    verifyStoreOwnership,
    async (req: Request, res: Response) => {
      try {
        const data = createProductWithVariantsSchema.parse(req.body);
        const result = await productService.createProductWithVariants(data);
        res.status(201).json(result);
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    }
  );

  // ------------------------
  // Update Product
  // ------------------------
  app.put(
    "/api/product/:id",
    authenticate,
    requireStoreOwner,
    verifyProductOwnership,
    async (req: Request, res: Response) => {
      try {
        const data = updateProductWithVariantsSchema.parse(req.body);
        const updated = await productService.updateProductWithVariants(
          req.params.id,
          data
        );
        res.json(updated);
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    }
  );

  // ------------------------
  // Get Product with Variants + Inventory
  // ------------------------
  app.get("/api/product/:id", async (req: Request, res: Response) => {
    try {
      const result = await productService.getProductWithVariants(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // ------------------------
  // Get all products by store
  // ------------------------
  app.get(
    "/api/product/store/:storeId",
    async (req: Request, res: Response) => {
      try {
        const { storeId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;
        const searchQuery = (req.query.query as string)?.trim() || "";

        const { products, totalCount } =
          await productService.getProductsByStore(
            storeId,
            limit,
            offset,
            searchQuery
          );

        res.json({ products, totalCount, page, limit });
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    }
  );

  // ------------------------
  // Delete Product
  // ------------------------
  app.delete(
    "/api/product/:id",
    authenticate,
    requireStoreOwner,
    verifyProductOwnership,
    async (req: Request, res: Response) => {
      try {
        await productService.deleteProduct(req.params.id);
        res.json({ success: true });
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    }
  );
}
