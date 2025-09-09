import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function useTrackAccess(
  trackId: string,
  user: User | null,
  hasPreviewOnly?: boolean
) {
  return useQuery({
    queryKey: ["/api/tracks", trackId, "access"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tracks/${trackId}/access`);
      if (!res.ok) {
        throw new Error("Failed to fetch broadcasts");
      }
      return res.json();
    },
    enabled: !!user && !!trackId && !!hasPreviewOnly,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
