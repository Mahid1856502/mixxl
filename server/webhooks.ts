import { orders, stores, User, users } from "@shared/schema";
import type { Express } from "express";
import { stripe } from "./stripe";
import Stripe from "stripe";
import { storage } from "./storage";
import express from "express";
import { getWSS } from "./ws";
import { randomUUID } from "crypto";
import { getStripeAccountStatus } from "./utils";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendEmail, EMAIL_FROM } from "./email";
import {
  generateArtistOrderEmail,
  generateCustomerOrderEmail,
  generatePaymentFailedEmail,
  generateRefundEmail,
} from "./templates/order-email";

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

            if (!purchase.trackId) {
              console.error(
                `❌ Track with ${purchase.trackId} not found for purchase`
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
                message: `${
                  buyer.fullName || buyer.username
                } purchased your track "${track.title}"`,
                actionUrl: `/profile/${track.artistId}`,
              });
            }

            break;
          }

          case "payment_intent.payment_failed": {
            const intent = event.data.object as any;
            await storage.updatePurchasedTrackBySessionId(intent.id, {
              paymentStatus: "failed",
            });
            break;
          }

          case "charge.refunded": {
            const charge = event.data.object as any;
            if (charge.payment_intent) {
              await storage.updatePurchasedTrackBySessionId(
                charge.payment_intent,
                { paymentStatus: "refunded" }
              );
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

  app.post(
    "/api/albums/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_BUY_ALBUMS_WEBHOOK_SECRET! // ⚠️ new webhook secret for albums
        );
      } catch (err) {
        console.error("❌ Webhook signature verification failed.", err);
        return res.sendStatus(400);
      }

      try {
        switch (event.type) {
          // ✅ Album purchase completed
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            // Update purchase record (mark as succeeded)
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

            if (!purchase.albumId) {
              console.error("❌ Album ID missing for purchase", {
                purchaseId: purchase.id,
              });
              break;
            }

            // Fetch album + buyer
            const [album, buyer] = await Promise.all([
              storage.getAlbum(purchase.albumId),
              storage.getUser(purchase.userId),
            ]);

            if (!album) {
              console.error("❌ Album not found for purchase", {
                purchaseId: purchase.id,
                albumId: purchase.albumId,
              });
            }

            if (!buyer) {
              console.error("❌ Buyer not found for purchase", {
                purchaseId: purchase.id,
                userId: purchase.userId,
              });
            }

            // 🔔 Notify artist
            if (album && buyer) {
              await storage.createNotification({
                userId: album.artistId,
                actorId: buyer.id,
                type: "purchase",
                title: "Album Purchased!",
                message: `${
                  buyer.fullName || buyer.username
                } purchased your album "${album.title}"`,
                actionUrl: `/profile/${album.artistId}`,
              });
            }

            break;
          }

          // ❌ Payment failed
          case "payment_intent.payment_failed": {
            const intent = event.data.object as any;
            await storage.updatePurchasedTrackBySessionId(intent.id, {
              paymentStatus: "failed",
            });
            break;
          }

          // 💸 Refund
          case "charge.refunded": {
            const charge = event.data.object as any;
            if (charge.payment_intent) {
              await storage.updatePurchasedTrackBySessionId(
                charge.payment_intent,
                { paymentStatus: "refunded" }
              );
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

  app.post(
    "/api/connect/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_UPDATE_CONNECTED_ACCOUNTS_WEBHOOK_SECRET!
        );
      } catch (err) {
        console.error("❌ Webhook signature verification failed.", err);
        return res.sendStatus(400);
      }

      try {
        if (event.type === "account.updated") {
          const account = event.data.object as Stripe.Account;
          const userId = account.metadata?.userId;

          if (!userId) {
            console.error(
              `⚠️ No userId found in metadata for account ${account.id}`
            );
            return res.sendStatus(400);
          }

          // Load previous state from DB
          const prevUser = await storage.getUser(userId);
          if (!prevUser) {
            console.error(`⚠️ User not found for account ${account.id}`);
            return res.sendStatus(404);
          }

          // Derive new status
          const { status, rejectReason } = getStripeAccountStatus(account);

          // If nothing meaningful changed, exit early (prevents spam)
          if (
            prevUser.stripeChargesEnabled === account.charges_enabled &&
            prevUser.stripePayoutsEnabled === account.payouts_enabled &&
            prevUser.stripeDisabledReason ===
              (account.requirements?.disabled_reason || null) &&
            prevUser.stripeAccountId === account.id
          ) {
            console.log(
              `ℹ️ No status change for account ${account.id} → skipping notification`
            );
            return res.sendStatus(200);
          }

          // Update DB with latest Stripe state
          await storage.updateUser(userId, {
            stripeAccountId: account.id,
            stripeChargesEnabled: account.charges_enabled || false,
            stripePayoutsEnabled: account.payouts_enabled || false,
            stripeDisabledReason: account.requirements?.disabled_reason || null,
            stripeRequirements: account.requirements || {},
            stripeAccountRaw: { id: account.id, type: account.type },
            lastStripeSyncAt: new Date(),
          });

          // Insert notification only if derived status actually changed
          const prevStatus = (() => {
            if (prevUser.stripeDisabledReason) return "rejected";
            if (prevUser.stripeChargesEnabled && prevUser.stripePayoutsEnabled)
              return "complete";
            if (prevUser.stripeAccountId) return "pending";
            return "none";
          })();

          if (prevStatus !== status) {
            const notification = await storage.createNotification({
              userId,
              actorId: userId, // system event
              type: "message",
              title: "Payout Account Update",
              message:
                status === "rejected"
                  ? `Your payout account was rejected: ${rejectReason}`
                  : `Your payout account status is now: ${status}`,
              actionUrl: "/dashboard/payouts",
              metadata: {
                stripeAccountId: account.id,
                status,
                rejectReason,
              },
            });

            // Push via WebSocket
            const wss = getWSS();
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "notification",
                    data: notification,
                  })
                );
              }
            });
          }
        }

        res.sendStatus(200);
      } catch (err) {
        console.error("❌ Webhook handler failed:", err);
        res.sendStatus(500);
      }
    }
  );

  app.post(
    "/api/orders/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_ORDERS_WEBHOOK_SECRET!
        );
      } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err);
        return res.sendStatus(400);
      }

      try {
        switch (event.type) {
          // Payment succeeded → mark order as succeeded
          case "payment_intent.succeeded": {
            const intent = event.data.object as Stripe.PaymentIntent;
            const orderId = intent.metadata.orderId;
            if (!orderId) break;

            const [order] = await db
              .select()
              .from(orders)
              .where(eq(orders.id, orderId));

            if (!order) break;

            const [store] = await db
              .select()
              .from(stores)
              .where(eq(stores.id, order.storeId));

            const [artist] = await db
              .select()
              .from(users)
              .where(eq(users.id, store.userId));

            // Fetch buyer (or fallback to guest)
            let buyerName = "Guest customer";
            let buyerEmail = "";

            if (order.buyerId) {
              const [buyer] = await db
                .select()
                .from(users)
                .where(eq(users.id, order.buyerId));

              if (buyer) {
                buyerName = buyer.fullName || "Customer";
                buyerEmail = buyer.email || "";
              }
            } else if (intent.shipping?.phone) {
              // guest checkout fallback
              buyerName = intent.shipping.name || "Guest customer";
              buyerEmail = intent.shipping.phone;
            }

            // CUSTOMER EMAIL
            if (buyerEmail && !order.customerEmailSend) {
              const email = generateCustomerOrderEmail(order);
              await sendEmail({
                to: buyerEmail,
                from: EMAIL_FROM,
                subject: email.subject,
                html: email.html,
                text: email.text,
              });

              await db
                .update(orders)
                .set({ customerEmailSend: true })
                .where(eq(orders.id, order.id));
            }

            // ARTIST EMAIL
            if (!order.artistEmailSend && artist?.email) {
              const email = generateArtistOrderEmail(order, {
                name: buyerName,
                email: buyerEmail || "Not provided",
              });

              await sendEmail({
                to: artist.email,
                from: EMAIL_FROM,
                subject: email.subject,
                html: email.html,
                text: email.text,
              });

              await db
                .update(orders)
                .set({ artistEmailSend: true })
                .where(eq(orders.id, order.id));
            }

            await db
              .update(orders)
              .set({ paymentStatus: "succeeded" })
              .where(eq(orders.id, orderId));

            break;
          }

          // Payment failed → mark order as failed
          case "payment_intent.payment_failed": {
            const intent = event.data.object as Stripe.PaymentIntent;
            const orderId = intent.metadata.orderId;
            if (!orderId) break;

            const [order] = await db
              .select()
              .from(orders)
              .where(eq(orders.id, orderId));

            if (order?.buyerId) {
              const [buyer] = await db
                .select()
                .from(users)
                .where(eq(users.id, order.buyerId));

              if (buyer?.email) {
                const email = generatePaymentFailedEmail(order);
                await sendEmail({
                  to: buyer.email,
                  from: EMAIL_FROM,
                  subject: email.subject,
                  html: email.html,
                  text: email.text,
                });
              }
            }

            await db
              .update(orders)
              .set({ paymentStatus: "failed" })
              .where(eq(orders.id, orderId));

            break;
          }

          // Refund → mark order as refunded
          case "charge.refunded": {
            const charge = event.data.object as Stripe.Charge;
            if (!charge.payment_intent) break;

            const [order] = await db
              .select()
              .from(orders)
              .where(
                eq(
                  orders.stripePaymentIntentId,
                  charge.payment_intent as string
                )
              );

            if (!order) break;

            const [store] = await db
              .select()
              .from(stores)
              .where(eq(stores.id, order.storeId));

            const [artist] = await db
              .select()
              .from(users)
              .where(eq(users.id, store.userId));

            // CUSTOMER
            if (order.buyerId && !order.refundEmailSend) {
              const [buyer] = await db
                .select()
                .from(users)
                .where(eq(users.id, order.buyerId));

              if (buyer?.email) {
                const email = generateRefundEmail(order, false);
                await sendEmail({
                  to: buyer.email,
                  from: EMAIL_FROM,
                  subject: email.subject,
                  html: email.html,
                  text: email.text,
                });
              }
            }

            // ARTIST
            if (artist?.email) {
              const email = generateRefundEmail(order, true);
              await sendEmail({
                to: artist.email,
                from: EMAIL_FROM,
                subject: email.subject,
                html: email.html,
                text: email.text,
              });
            }

            await db
              .update(orders)
              .set({
                paymentStatus: "refunded",
                refundEmailSend: true,
              })
              .where(eq(orders.id, order.id));

            break;
          }

          default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err) {
        console.error("🔥 Orders webhook handler error:", err);
        res.status(500).send("Webhook handler error");
      }
    }
  );

  // TICKETS WEBHOOK
  app.post(
    "/api/tickets/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_TICKETS_WEBHOOK_SECRET!
        );
      } catch (err) {
        return res.status(400).send("Webhook signature verification failed");
      }

      try {
        const { ticketService } = await import("./modules/tickets/tickets.service");
        await ticketService.handleStripeWebhook(event);
        res.json({ received: true });
      } catch (err) {
        console.error("Tickets webhook handler error:", err);
        res.status(500).send("Webhook handler failed");
      }
    }
  );
}
