import { db } from "server/db";
import {
  CreateEvent,
  events,
  eventTicketTypes,
  ticketOrders,
  UpdateEvent,
  users,
} from "@shared/schema";
import { and, asc, eq, isNull, sql } from "drizzle-orm";

interface CreateEventParams {
  data: CreateEvent;
  userId: string;
}

interface UpdateEventParams {
  eventId: string;
  data: UpdateEvent;
  userId: string;
}

interface DeleteEventParams {
  eventId: string;
  userId: string;
}

export const eventService = {
  createEvent: async ({ data, userId }: CreateEventParams) => {
    const { tickets, ...eventData } = data;

    return await db.transaction(async (tx) => {
      const [event] = await tx
        .insert(events)
        .values({
          ...eventData,
          hostUserId: userId,
          status: "published",
        })
        .returning();

      if (!event) throw new Error("Failed to create event");

      if (tickets.length > 0) {
        await tx.insert(eventTicketTypes).values(
          tickets.map((ticket) => ({
            eventId: event.id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            capacity: ticket.capacity,
            isActive: true,
          })),
        );
      }

      return event;
    });
  },

  getAllEvents: async () => {
    return db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDateTime: events.startDateTime,
        venue: events.venue,
        location: events.location,
        coverImageUrl: events.coverImageUrl,
        status: events.status,
        createdAt: events.createdAt,
        genre: events.genre,

        hostName: users.fullName,

        lowestTicketPrice: sql<number>`MIN(${eventTicketTypes.price})`,
        capacity: sql<number>`COALESCE(SUM(${eventTicketTypes.capacity}), 0)`,
        soldCount: sql<number>`COALESCE(SUM(${eventTicketTypes.soldCount}), 0)`,
      })
      .from(events)
      .leftJoin(users, eq(users.id, events.hostUserId))
      .leftJoin(eventTicketTypes, eq(eventTicketTypes.eventId, events.id))
      .groupBy(events.id, users.fullName);
  },

  getEventById: async (id: string) => {
    const event = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDateTime: events.startDateTime,
        venue: events.venue,
        location: events.location,
        coverImageUrl: events.coverImageUrl,
        status: events.status,
        createdAt: events.createdAt,
        genre: events.genre,
        hostUserId: events.hostUserId,
        hostName: users.fullName,
        lowestTicketPrice: sql<number>`MIN(${eventTicketTypes.price})`,
        capacity: sql<number>`COALESCE(SUM(${eventTicketTypes.capacity}), 0)`,
        soldCount: sql<number>`COALESCE(SUM(${eventTicketTypes.soldCount}), 0)`,
      })
      .from(events)
      .leftJoin(users, eq(users.id, events.hostUserId))
      .leftJoin(eventTicketTypes, eq(eventTicketTypes.eventId, events.id))
      .where(and(eq(events.id, id), isNull(events.deletedAt)))
      .groupBy(events.id, users.fullName)
      .limit(1);

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    const [tickets, revenueResult] = await Promise.all([
      db
        .select({
          id: eventTicketTypes.id,
          name: eventTicketTypes.name,
          description: eventTicketTypes.description,
          price: eventTicketTypes.price,
          capacity: eventTicketTypes.capacity,
          soldCount: eventTicketTypes.soldCount,
          isActive: eventTicketTypes.isActive,
        })
        .from(eventTicketTypes)
        .where(eq(eventTicketTypes.eventId, id)),
      db
        .select({
          revenue: sql<string>`COALESCE(SUM(${ticketOrders.totalAmount}), 0)`,
        })
        .from(ticketOrders)
        .where(
          and(eq(ticketOrders.eventId, id), eq(ticketOrders.status, "paid")),
        ),
    ]);

    const revenue =
      revenueResult[0]?.revenue != null
        ? parseFloat(String(revenueResult[0].revenue))
        : 0;

    return {
      ...event[0],
      tickets,
      revenue,
    };
  },

  getEventsByHost: async (hostUserId: string) => {
    return db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDateTime: events.startDateTime,
        venue: events.venue,
        location: events.location,
        coverImageUrl: events.coverImageUrl,
        status: events.status,
        createdAt: events.createdAt,
        genre: events.genre,

        hostName: users.fullName,

        lowestTicketPrice: sql<number>`MIN(${eventTicketTypes.price})`,
        capacity: sql<number>`COALESCE(SUM(${eventTicketTypes.capacity}), 0)`,
        soldCount: sql<number>`COALESCE(SUM(${eventTicketTypes.soldCount}), 0)`,
      })
      .from(events)
      .leftJoin(users, eq(users.id, events.hostUserId))
      .leftJoin(eventTicketTypes, eq(eventTicketTypes.eventId, events.id))
      .where(and(eq(events.hostUserId, hostUserId), isNull(events.deletedAt)))
      .groupBy(events.id, users.fullName);
  },

  getHostDashboardStats: async (hostUserId: string) => {
    const [statsRow, revenueRow] = await Promise.all([
      db
        .select({
          totalTicketsSold: sql<number>`COALESCE(SUM(${eventTicketTypes.soldCount}), 0)`,
          totalCapacity: sql<number>`COALESCE(SUM(${eventTicketTypes.capacity}), 0)`,
          eventCount: sql<number>`COUNT(DISTINCT ${events.id})`,
        })
        .from(events)
        .leftJoin(eventTicketTypes, eq(eventTicketTypes.eventId, events.id))
        .where(
          and(eq(events.hostUserId, hostUserId), isNull(events.deletedAt)),
        ),
      db
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(${ticketOrders.totalAmount}), 0)`,
        })
        .from(events)
        .innerJoin(ticketOrders, eq(ticketOrders.eventId, events.id))
        .where(
          and(
            eq(events.hostUserId, hostUserId),
            isNull(events.deletedAt),
            eq(ticketOrders.status, "paid"),
          ),
        ),
    ]);

    const row = statsRow[0];
    const revRow = revenueRow[0];
    const totalRevenue =
      revRow?.totalRevenue != null
        ? parseFloat(String(revRow.totalRevenue))
        : 0;
    return {
      totalTicketsSold: Number(row?.totalTicketsSold ?? 0),
      totalCapacity: Number(row?.totalCapacity ?? 0),
      totalRevenue,
      eventCount: Number(row?.eventCount ?? 0),
    };
  },

  getTicketsByEventId: async (eventId: string) => {
    const event = await db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
      .limit(1);

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    return db
      .select({
        id: eventTicketTypes.id,
        name: eventTicketTypes.name,
        description: eventTicketTypes.description,
        price: eventTicketTypes.price,
        capacity: eventTicketTypes.capacity,
        soldCount: eventTicketTypes.soldCount,
        available: sql<number>`
        ${eventTicketTypes.capacity} - ${eventTicketTypes.soldCount}
      `,
      })
      .from(eventTicketTypes)
      .where(
        and(
          eq(eventTicketTypes.eventId, eventId),
          eq(eventTicketTypes.isActive, true),
        ),
      )
      .orderBy(asc(eventTicketTypes.price));
  },

  updateEvent: async ({ eventId, data }: UpdateEventParams) => {
    const { tickets, ...eventData } = data;

    return db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: events.id })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Event not found");
      }

      const [updatedEvent] = await tx
        .update(events)
        .set({
          ...eventData,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error("Failed to update event");
      }

      if (tickets) {
        // Remove existing ticket types
        await tx
          .delete(eventTicketTypes)
          .where(eq(eventTicketTypes.eventId, eventId));

        // Insert new ticket types
        if (tickets.length > 0) {
          await tx.insert(eventTicketTypes).values(
            tickets.map((ticket) => ({
              eventId,
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              capacity: ticket.capacity,
              isActive: true,
            })),
          );
        }
      }

      return updatedEvent;
    });
  },

  deleteEvent: async ({ eventId, userId }: DeleteEventParams) => {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({
          id: events.id,
          hostUserId: events.hostUserId,
          deletedAt: events.deletedAt,
        })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Event not found");
      }

      if (existing[0].deletedAt) {
        throw new Error("Event already deleted");
      }

      if (existing[0].hostUserId !== userId) {
        throw new Error("Unauthorized");
      }

      // Soft-delete event
      const [updatedEvent] = await tx
        .update(events)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId))
        .returning({ id: events.id });

      if (!updatedEvent) {
        throw new Error("Failed to delete event");
      }

      // Optional but recommended: deactivate tickets
      await tx
        .update(eventTicketTypes)
        .set({ isActive: false })
        .where(eq(eventTicketTypes.eventId, eventId));

      return updatedEvent;
    });
  },
};
