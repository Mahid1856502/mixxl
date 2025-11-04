import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Track } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function fetchUserTracks(userId?: string) {
  const url = userId
    ? `/api/users/tracks?userId=${userId}`
    : `/api/users/tracks`;
  const res = await apiRequest("GET", url);
  if (!res.ok) {
    throw new Error("Failed to fetch user tracks");
  }
  return res.json();
}

export function useUserTracks(enabled: boolean = false, userId?: string) {
  return useQuery({
    queryKey: ["userTracks", userId], // 👈 cache per userId
    queryFn: () => fetchUserTracks(userId),
    enabled: !!enabled,
  });
}

async function fetchTrack(trackId: string): Promise<Track> {
  const res = await apiRequest("GET", `/api/tracks/${trackId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch track");
  }

  return res.json();
}

export function useTrack(trackId?: string) {
  return useQuery({
    queryKey: ["track", trackId],
    queryFn: () => fetchTrack(trackId!), // non-null assertion since `enabled` guards it
    enabled: !!trackId, // don’t run unless trackId is provided
    retry: false, // disable retry if 404 means “not found”
  });
}

export function useDeleteTrack(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/tracks/${id}`);
      if (!res.ok) throw new Error("Failed to delete track");
    },
    onSuccess: (_, id) => {
      toast({ title: `Track deleted successfully! ${id}` });
      // Invalidate cached lists and single track query
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", id] });
      queryClient.invalidateQueries({ queryKey: ["userTracks", userId] });
    },
    onError: (error) => {
      toast({ title: "Error deleting track", description: error.message });
    },
  });
}
