import { apiRequest } from "@/lib/queryClient";
import { Track } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

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
