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

  app.post(
    "/api/tracks/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_BUY_TRACKS_WEBHOOK_SECRET!
        );
      } catch (err) {
        console.error("Webhook signature verification failed.", err);
        return res.sendStatus(400);
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            // Update purchase record
            const purchase = await storage.updatePurchasedTrackBySessionId(
              session.id,
              {
                stripePaymentIntentId: session.payment_intent as string,
                paymentStatus: "succeeded",
                purchasedAt: new Date(),
              }
            );

            if (!purchase) {
              console.warn(
                "⚠️ No purchase record found for session",
                session.id
              );
              break;
            }

            // Fetch related entities safely
            const [track, buyer] = await Promise.all([
              storage.getTrack(purchase.trackId),
              storage.getUser(purchase.userId),
            ]);

            if (!track) {
              console.error("❌ Track not found for purchase", {
                purchaseId: purchase.id,
                trackId: purchase.trackId,
              });
            }

            if (!buyer) {
              console.error("❌ Buyer not found for purchase", {
                purchaseId: purchase.id,
                userId: purchase.userId,
              });
            }

            if (track && buyer) {
              await storage.createNotification({
                userId: track.artistId,
                actorId: buyer.id,
                type: "purchase", // clearer semantic than "tip"
                title: "Track Purchased!",
                message: `${buyer.firstName ?? ""} ${
                  buyer.lastName ?? ""
                } purchased your track "${track.title}"`,
                actionUrl: `/profile/${track.artistId}`,
              });
            }

            console.log("✅ Purchase recorded", { purchaseId: purchase.id });
            break;
          }

          case "payment_intent.payment_failed": {
            const intent = event.data.object as any;
            await storage.updatePurchasedTrackBySessionId(intent.id, {
              paymentStatus: "failed",
            });
            console.log("⚠️ Purchase failed", { intentId: intent.id });
            break;
          }

          case "charge.refunded": {
            const charge = event.data.object as any;
            if (charge.payment_intent) {
              await storage.updatePurchasedTrackBySessionId(
                charge.payment_intent,
                { paymentStatus: "refunded" }
              );
              console.log("💸 Purchase refunded", {
                intent: charge.payment_intent,
              });
            }
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err) {
        console.error("🔥 Webhook handler error:", err);
        res.status(500).send("Webhook handler error");
      }
    }
  );
}
