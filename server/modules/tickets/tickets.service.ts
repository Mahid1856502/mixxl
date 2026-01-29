import { db } from "server/db";
import Stripe from "stripe";
import {
  events,
  eventTicketTypes,
  ticketOrders,
  issuedTickets,
  users,
} from "@shared/schema";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { stripe } from "server/stripe";
import { sendEmail } from "server/email";
import { generateTicketConfirmationEmail } from "server/templates/order-email";

interface CreateCheckoutParams {
  userId: string;
  eventId: string;
  tickets: {
    ticketTypeId: string;
    quantity: number;
  }[];
  attendeeName?: string;
  attendeeEmail?: string;
}

export const ticketService = {
  createPaymentIntent: async ({
    userId,
    eventId,
    tickets,
    attendeeName,
    attendeeEmail,
  }: CreateCheckoutParams) => {
    return db.transaction(async (tx) => {
      const event = await tx
        .select({ id: events.id, hostUserId: events.hostUserId })
        .from(events)
        .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
        .limit(1);

      if (event.length === 0) {
        throw new Error("Event not found");
      }

      // Prevent event host from buying their own tickets
      if (userId && event[0].hostUserId === userId) {
        throw new Error("You cannot purchase tickets for your own event");
      }

      // Fetch ticket types
      const ticketTypes = await tx
        .select()
        .from(eventTicketTypes)
        .where(
          and(
            eq(eventTicketTypes.eventId, eventId),
            eq(eventTicketTypes.isActive, true),
          ),
        );

      let totalAmount = 0;
      let totalQuantity = 0;

      for (const item of tickets) {
        const type = ticketTypes.find((t) => t.id === item.ticketTypeId);

        if (!type) throw new Error("Invalid ticket type");

        const available = type.capacity - type.soldCount;
        if (item.quantity > available) {
          throw new Error("Not enough tickets available");
        }

        const unitAmount = Number(type.price);
        totalAmount += unitAmount * item.quantity;
        totalQuantity += item.quantity;
      }

      // Create pending order with attendee info snapshot
      const orderValues = {
        eventId,
        userId,
        totalAmount: totalAmount.toString(),
        quantity: totalQuantity,
        status: "pending" as const,
        currency: "gbp" as const,
        ...(attendeeName && { attendeeName }),
        ...(attendeeEmail && { attendeeEmail }),
      };

      const [order] = await tx
        .insert(ticketOrders)
        .values(orderValues as any)
        .returning();

      if (!order) throw new Error("Failed to create order");

      // Create payment intent
      const amountInCents = Math.round(totalAmount * 100);
      // Store ticket type IDs and quantities in metadata (comma-separated for multiple types)
      const ticketTypeIds = tickets.map((t) => t.ticketTypeId).join(",");
      const ticketQuantities = tickets.map((t) => t.quantity).join(",");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id,
          eventId: eventId,
          ticketTypeIds: ticketTypeIds,
          ticketQuantities: ticketQuantities,
        },
      });

      // Update order with payment intent ID
      await tx
        .update(ticketOrders)
        .set({
          paymentProvider: "stripe",
          paymentIntentId: paymentIntent.id,
        })
        .where(eq(ticketOrders.id, order.id));

      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret!,
      };
    });
  },

  handleStripeWebhook: async (event: Stripe.Event) => {
    let orderId: string | undefined;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      orderId = session.metadata?.orderId;
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      orderId = paymentIntent.metadata?.orderId;
    } else {
      return; // Unhandled event type
    }

    if (!orderId) return;

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(ticketOrders)
        .where(eq(ticketOrders.id, orderId as string))
        .limit(1);

      if (!order || order.status === "paid") return;

      await tx
        .update(ticketOrders)
        .set({ status: "paid" })
        .where(eq(ticketOrders.id, orderId as string));

      // Get ticket type IDs and quantities from metadata (for payment_intent events)
      let ticketTypeIds: string[] = [];
      let ticketQuantities: number[] = [];

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const typeIdsStr = paymentIntent.metadata?.ticketTypeIds;
        const quantitiesStr = paymentIntent.metadata?.ticketQuantities;

        if (typeIdsStr && quantitiesStr) {
          ticketTypeIds = typeIdsStr.split(",");
          ticketQuantities = quantitiesStr
            .split(",")
            .map((q) => parseInt(q, 10));
        }
      }

      // Fetch ticket types for this event
      const ticketTypes = await tx
        .select()
        .from(eventTicketTypes)
        .where(eq(eventTicketTypes.eventId, order.eventId));

      // Store issued ticket IDs for email
      const issuedTicketIds: string[] = [];

      // If we have ticket type breakdown from metadata, use it
      if (ticketTypeIds.length > 0 && ticketQuantities.length > 0) {
        for (let i = 0; i < ticketTypeIds.length; i++) {
          const ticketTypeId = ticketTypeIds[i];
          const quantity = ticketQuantities[i];

          if (quantity <= 0) continue;

          const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
          if (!ticketType) continue;

          // Update sold count
          await tx
            .update(eventTicketTypes)
            .set({
              soldCount: sql`${eventTicketTypes.soldCount} + ${quantity}`,
            })
            .where(eq(eventTicketTypes.id, ticketType.id));

          // Issue tickets
          const newTickets = await tx
            .insert(issuedTickets)
            .values(
              Array.from({ length: quantity }).map(() => ({
                orderId: order.id,
                eventId: order.eventId,
                ticketTypeId: ticketType.id,
                ownerUserId: order.userId,
                status: "active" as const,
              })),
            )
            .returning({ id: issuedTickets.id });

          issuedTicketIds.push(...newTickets.map((t) => t.id));
        }
      } else {
        // Fallback: use order quantity (for checkout.session.completed events)
        const quantity = order.quantity;
        if (quantity <= 0) return;

        const ticketType = ticketTypes[0]; // Fallback to first ticket type
        if (ticketType) {
          // Update sold count
          await tx
            .update(eventTicketTypes)
            .set({
              soldCount: sql`${eventTicketTypes.soldCount} + ${quantity}`,
            })
            .where(eq(eventTicketTypes.id, ticketType.id));

          // Issue tickets
          const newTickets = await tx
            .insert(issuedTickets)
            .values(
              Array.from({ length: quantity }).map(() => ({
                orderId: order.id,
                eventId: order.eventId,
                ticketTypeId: ticketType.id,
                ownerUserId: order.userId,
                status: "active" as const,
              })),
            )
            .returning({ id: issuedTickets.id });

          issuedTicketIds.push(...newTickets.map((t) => t.id));
        }
      }

      // Send email with ticket confirmation
      // Use attendeeEmail from order if available, otherwise fetch user email
      let recipientEmail = order.attendeeEmail;

      if (!recipientEmail && order.userId) {
        const [user] = await tx
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);

        if (user) {
          recipientEmail = user.email;
        }
      }

      if (recipientEmail && issuedTicketIds.length > 0) {
        // Fetch event details
        const [eventDetails] = await tx
          .select()
          .from(events)
          .where(eq(events.id, order.eventId))
          .limit(1);

        if (eventDetails) {
          // Fetch issued tickets with ticket type info
          const issuedTicketsWithTypes = await tx
            .select({
              id: issuedTickets.id,
              ticketTypeName: eventTicketTypes.name,
              ticketTypePrice: eventTicketTypes.price,
            })
            .from(issuedTickets)
            .innerJoin(
              eventTicketTypes,
              eq(issuedTickets.ticketTypeId, eventTicketTypes.id),
            )
            .where(eq(issuedTickets.orderId, order.id));

          if (issuedTicketsWithTypes.length > 0) {
            const emailContent = generateTicketConfirmationEmail(
              order,
              eventDetails,
              issuedTicketsWithTypes,
            );

            // Send email asynchronously (don't block transaction)
            sendEmail({
              to: recipientEmail,
              from: "noreply@mixxl.fm",
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            }).catch((error) => {
              console.error("Failed to send ticket confirmation email:", error);
            });
          }
        }
      }
    });
  },
};
