import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTrack, Track, TrackExtended } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { DiscoverFilters } from "../artists/useArtists";

export function useTracks(filters: DiscoverFilters = {}) {
  return useQuery<TrackExtended[], Error>({
    queryKey: ["tracks", filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>);
      const url = `/api/tracks${query.toString() ? `?${query}` : ""}`;
      const res = await apiRequest("GET", url);

      if (!res.ok) {
        throw new Error("Failed to fetch tracks");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!filters?.enable,
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation<Track, Error, InsertTrack>({
    mutationFn: async (data: InsertTrack) => {
      const res = await apiRequest("POST", "/api/tracks", data);
      if (!res.ok) throw new Error("Failed to create track");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Track creatd successfully!",
      });
      // Invalidate tracks list so new track appears
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
  });
}
