import { apiRequest } from "@/lib/queryClient";
import { AdminBroadcast } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function useAllBroadcasts() {
  return useQuery<AdminBroadcast[], Error>({
    queryKey: ["allBroadcasts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/broadcasts");
      if (!res.ok) {
        throw new Error("Failed to fetch broadcasts");
      }
      return res.json() as Promise<AdminBroadcast[]>;
    },
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  });
}
