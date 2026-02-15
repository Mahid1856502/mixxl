import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      queryClient.invalidateQueries({ queryKey: ["profile", track.artistId] });
    },
  });
}
