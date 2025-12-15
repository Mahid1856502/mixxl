import type { Express, Request, Response } from "express";
import { authenticate } from "server/admin-routes";
import { orderService } from "./order.service";

export function registerOrderRoutes(app: Express) {
  app.get(
    "/api/order/:id", // can be payment intent id or internal order id
    authenticate,
    async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      try {
        const result = await orderService.getOrderById(id);
        res.status(200).json(result);
      } catch (err) {
        res.status(404).json({ error: (err as Error).message });
      }
    }
  );
}
