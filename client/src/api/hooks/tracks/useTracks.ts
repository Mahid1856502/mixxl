import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTrack, Track, TrackExtended } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export function useTracks() {
  return useQuery<TrackExtended[], Error>({
    queryKey: ["/api/tracks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tracks");
      if (!res.ok) {
        throw new Error("Failed to fetch tracks");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
