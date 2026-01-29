import type { Express, Request, Response } from "express";
import express from "express";
import { authenticate } from "server/admin-routes";
import { ticketService } from "./tickets.service";
import Stripe from "stripe";
import { stripe } from "server/stripe";

export function registerTicketRoutes(app: Express) {
  // CREATE PAYMENT INTENT FOR TICKETS
  app.post( 
    "/api/tickets/payment-intent",
    authenticate,
    async (req: Request, res: Response) => {
      try {
        const { eventId, tickets, attendeeName, attendeeEmail } = req.body;

        const result = await ticketService.createPaymentIntent({
          userId: req.user.id,
          eventId,
          tickets,
          attendeeName,
          attendeeEmail,
        });

        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(400).json({
          error: {
            message: err instanceof Error ? err.message : "Payment intent creation failed",
          },
        });
      }
    }
  );

  // Note: Webhook route is registered in server/webhooks.ts to ensure
  // it's registered before the JSON body parser
}
