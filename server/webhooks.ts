import { User } from "@shared/schema";
import type { Express } from "express";
import { stripe } from "./stripe";
import Stripe from "stripe";
import { storage } from "./storage";
import express from "express";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}

export function registerWebhooksRoutes(app: Express) {
  app.post(
    "/api/tips/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        console.error("Webhook signature verification failed.", err);
        return res.sendStatus(400);
      }

      if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object;
        const tipId = pi.metadata.tipId;
        await storage.updateTipStatus(tipId, "completed", pi.id);
      }

      if (event.type === "payment_intent.payment_failed") {
        const pi = event.data.object;
        const tipId = pi.metadata.tipId;
        await storage.updateTipStatus(tipId, "rejected", pi.id);
      }

      res.json({ received: true });
    }
  );
}
