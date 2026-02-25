import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTrack, Track } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export function useAdminCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation<Track, Error, InsertTrack>({
    mutationFn: async (data: InsertTrack) => {
      const res = await apiRequest("POST", "/api/admin/tracks", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to create track");
      }
      return res.json();
    },
    onSuccess: (track) => {
      toast({ title: "Track uploaded successfully on behalf of artist" });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", track.id] });
      queryClient.invalidateQueries({ queryKey: ["userTracks"] });
    },
  });
}

export function useAdminTrack(trackId: string | undefined) {
  return useQuery<Track, Error>({
    queryKey: ["admin", "track", trackId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/tracks/${trackId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to fetch track");
      }
      return res.json();
    },
    enabled: !!trackId,
  });
}

export function useAdminUpdateTrack() {
  const queryClient = useQueryClient();

  return useMutation<Track, Error, { id: string; updates: Partial<Track> }>({
    mutationFn: async ({ id, updates }) => {
      const res = await apiRequest("PUT", `/api/admin/tracks/${id}`, updates);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update track");
      }
      return res.json();
    },
    onSuccess: (track) => {
      toast({ title: "Track updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", track.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "track", track.id] });
      queryClient.invalidateQueries({ queryKey: ["userTracks"] });
    },
  });
}
