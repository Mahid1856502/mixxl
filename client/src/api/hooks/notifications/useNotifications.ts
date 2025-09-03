import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// --- Notifications ---
export function useNotifications() {
  return useQuery<any[], Error>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json() as Promise<any[]>;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

// --- Unread Notifications Count ---
export function useUnreadNotificationCount() {
  return useQuery<{ count: number }, Error>({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications/unread-count");
      if (!res.ok)
        throw new Error("Failed to fetch unread notifications count");
      return res.json() as Promise<{ count: number }>;
    },
    staleTime: 1 * 60 * 1000, // cache for 1 minute
    // refetchInterval: 30000, // uncomment to refetch every 30 seconds
  });
}
