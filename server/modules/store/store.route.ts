// store.route.ts
import type { Express, Request, Response } from "express";
import * as storeService from "./store.service";
import { requireStoreOwner } from "../products/product.route";
import { authenticate } from "server/admin-routes";

export function registerStoreRoutes(app: Express) {
  // 1. Setup Store
  app.post("/api/store", authenticate, async (req: Request, res: Response) => {
    if (req.user.role !== "artist") {
      return res.status(403).json({ error: "Store owner access required" });
    }
    const store = await storeService.setupStore(req.body);
    res.status(201).json(store);
  });

  // 2. Update Store
  app.put(
    "/api/store/:id",
    authenticate,
    requireStoreOwner,
    async (req: Request, res: Response) => {
      if (req.params.id !== req.store.id) {
        return res.status(403).json({ error: "Store owner access required" });
      }
      const updated = await storeService.updateStore(req.params.id, req.body);
      res.json(updated);
    }
  );

  // Optional: get user's store
  app.get("/api/store/user/:userId", async (req, res) => {
    const store = await storeService.getStoreByUser(req.params.userId);
    res.json(store);
  });
}
