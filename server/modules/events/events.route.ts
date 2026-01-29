import type { Express, Request, Response } from "express";
import { authenticate } from "server/admin-routes";
import { eventService } from "./events.service";
import { createEventFormSchema, updateEventFormSchema } from "@shared/schema";
import { ZodError } from "zod";

export function registerEventRoutes(app: Express) {
  // CREATE
  app.post("/api/events", authenticate, async (req: Request, res: Response) => {
    try {
      const payload = {
        ...req.body,
        startDateTime: new Date(req.body.startDateTime),
      };
      const data = createEventFormSchema.parse(payload);
      const event = await eventService.createEvent({
        data,
        userId: req.user.id,
      });
      res.status(201).json(event);
    } catch (err) {
      console.error(err);
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: { message: "Validation failed", details: err.issues },
        });
      }
      if (err instanceof Error)
        return res.status(400).json({ error: { message: err.message } });
      return res
        .status(500)
        .json({ error: { message: "Failed to create event" } });
    }
  });

  // GET ALL
  app.get("/api/events", async (_req: Request, res: Response) => {
    try {
      const events = await eventService.getAllEvents();
      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: { message: "Failed to fetch events" } });
    }
  });

  // GET DASHBOARD STATS BY HOST (must be before /:id)
  app.get(
    "/api/events/dashboard-stats/:hostUserId",
    async (req: Request, res: Response) => {
      try {
        const stats = await eventService.getHostDashboardStats(
          req.params.hostUserId,
        );
        res.json(stats);
      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: { message: "Failed to fetch dashboard stats" },
        });
      }
    },
  );

  // GET BY ID
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.json(event);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === "Event not found") {
        return res.status(404).json({ error: { message: "Event not found" } });
      }
      res.status(500).json({ error: { message: "Failed to fetch event" } });
    }
  });

  // GET BY HOST
  app.get(
    "/api/events/host/:hostUserId",
    async (req: Request, res: Response) => {
      try {
        const events = await eventService.getEventsByHost(
          req.params.hostUserId,
        );
        res.json(events);
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: { message: "Failed to fetch events by host" } });
      }
    },
  );

  app.get(
    "/api/events/tickets/:eventId",
    async (req: Request, res: Response) => {
      try {
        const { eventId } = req.params;

        const tickets = await eventService.getTicketsByEventId(eventId);

        res.json(tickets);
      } catch (err) {
        console.error(err);

        if (err instanceof Error && err.message === "Event not found") {
          return res.status(404).json({
            error: { message: "Event not found" },
          });
        }

        res.status(500).json({
          error: { message: "Failed to fetch tickets" },
        });
      }
    },
  );

  // UPDATE
  app.put(
    "/api/events/:id",
    authenticate,
    async (req: Request, res: Response) => {
      try {
        const payload = {
          ...req.body,
          ...(req.body.startDateTime && {
            startDateTime: new Date(req.body.startDateTime),
          }),
        };

        const data = updateEventFormSchema.parse(payload);

        const event = await eventService.updateEvent({
          eventId: req.params.id,
          data,
          userId: req.user.id,
        });

        res.json(event);
      } catch (err) {
        console.error(err);

        if (err instanceof ZodError) {
          return res.status(400).json({
            error: {
              message: "Validation failed",
              details: err.issues,
            },
          });
        }

        if (err instanceof Error) {
          if (err.message === "Event not found") {
            return res.status(404).json({
              error: { message: "Event not found" },
            });
          }

          return res.status(400).json({
            error: { message: err.message },
          });
        }

        res.status(500).json({
          error: { message: "Failed to update event" },
        });
      }
    },
  );

  app.delete(
    "/api/events/:id",
    authenticate,
    async (req: Request, res: Response) => {
      try {
        const result = await eventService.deleteEvent({
          eventId: req.params.id,
          userId: req.user.id,
        });

        res.status(200).json({
          success: true,
          deletedEventId: result.id,
        });
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          if (err.message === "Event not found") {
            return res.status(404).json({
              error: { message: "Event not found" },
            });
          }

          if (err.message === "Unauthorized") {
            return res.status(403).json({
              error: { message: "Not allowed to delete this event" },
            });
          }

          return res.status(400).json({
            error: { message: err.message },
          });
        }

        res.status(500).json({
          error: { message: "Failed to delete event" },
        });
      }
    },
  );
}
