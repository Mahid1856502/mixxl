import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateEvent,
  Event,
  EventWithTickets,
  UpdateEvent,
} from "@shared/schema";

export interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: string; // decimal as string from Postgres
  capacity: number;
  soldCount: number;
  available: number;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEvent) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "dashboard-stats"],
      });

      toast({
        title: "Event published!",
        description: "Your event has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Event creation failed",
        description: error?.error?.message || "Unable to create event",
        variant: "destructive",
      });
    },
  });
}

// GET ALL EVENTS
export function useGetAllEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return response.json();
    },
  });
}

// GET EVENT BY ID
export function useGetEventById(eventId?: string) {
  return useQuery<EventWithTickets>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      return response.json();
    },
    enabled: !!eventId, // only run if eventId exists
  });
}

// GET EVENTS BY HOST
export function useGetEventsByHost(hostUserId?: string) {
  return useQuery<Event[]>({
    queryKey: ["events", "host", hostUserId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/events/host/${hostUserId}`,
      );
      return response.json();
    },
    enabled: !!hostUserId,
  });
}

// GET DASHBOARD STATS BY HOST (aggregate metrics for top cards)
export interface EventDashboardStats {
  totalTicketsSold: number;
  totalCapacity: number;
  totalRevenue: number;
  eventCount: number;
}

export function useGetEventDashboardStats(hostUserId?: string) {
  return useQuery<EventDashboardStats>({
    queryKey: ["events", "dashboard-stats", hostUserId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/events/dashboard-stats/${hostUserId}`,
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData?.error?.message || "Failed to fetch dashboard stats",
        );
      }
      return response.json();
    },
    enabled: !!hostUserId,
  });
}

export function useGetEventTickets(eventId?: string) {
  return useQuery<TicketType[]>({
    queryKey: ["eventTickets", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiRequest(
        "GET",
        `/api/events/tickets/${eventId}`,
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || "Failed to fetch tickets");
      }

      return response.json();
    },
    enabled: !!eventId,
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId: string;
      data: UpdateEvent;
    }) => {
      const response = await apiRequest("PUT", `/api/events/${eventId}`, data);

      if (!response.ok) {
        const err = await response.json();
        throw err;
      }

      return response.json();
    },

    onSuccess: (updatedEvent: Event) => {
      // Update single-event cache
      queryClient.setQueryData(["event", updatedEvent.id], updatedEvent);

      // Refresh lists and dashboard stats
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", "host"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "dashboard-stats"],
      });

      toast({
        title: "Event updated",
        description: "Your changes have been saved successfully.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error?.error?.message || "Unable to update event",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("DELETE", `/api/events/${eventId}`);

      if (!response.ok) {
        const err = await response.json();
        throw err;
      }

      return response.json();
    },

    onSuccess: (_data, eventId) => {
      // Remove deleted event from cache
      queryClient.removeQueries({ queryKey: ["event", eventId] });

      // Refresh event lists and dashboard stats
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", "host"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "dashboard-stats"],
      });

      toast({
        title: "Event deleted",
        description: "The event and its tickets were permanently removed.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.error?.message || "Unable to delete event",
        variant: "destructive",
      });
    },
  });
}

// CREATE TICKET PAYMENT INTENT
export interface CreateTicketPaymentIntentInput {
  eventId: string;
  tickets: {
    ticketTypeId: string;
    quantity: number;
  }[];
  attendeeName?: string;
  attendeeEmail?: string;
}

export interface TicketPaymentIntentResponse {
  orderId: string;
  clientSecret: string;
}

export function useCreateTicketPaymentIntent() {
  return useMutation<
    TicketPaymentIntentResponse,
    Error,
    CreateTicketPaymentIntentInput
  >({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/tickets/payment-intent", data);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message || "Failed to create payment intent",
        );
      }

      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
    retry: 0,
  });
}
