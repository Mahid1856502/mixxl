import { apiRequest } from "@/lib/queryClient";
import { Playlist } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchPlaylists(identifier: string): Promise<Playlist[]> {
  const res = await apiRequest("GET", `/api/users/${identifier}/playlists`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlists");
  }

  return res.json();
}

export function useUserPlaylists(identifier: string | undefined) {
  return useQuery({
    queryKey: ["userPlaylists", identifier],
    queryFn: () => fetchPlaylists(identifier!),
    enabled: !!identifier, // only fetch if identifier is defined
    staleTime: 5 * 60 * 1000, // 5 minutes cache freshness
    retry: 1,
  });
}

export function usePublicPlaylists() {
  return useQuery<Playlist[], Error>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/playlists");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json() as Promise<Playlist[]>;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

// ✅ New mutation hook
export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      trackId,
    }: {
      playlistId: string;
      trackId: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/playlists/${playlistId}/tracks`,
        { trackId }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add track to playlist");
      }

      return res.json();
    },
    onSuccess: (_, { playlistId }) => {
      // invalidate so playlists update with new track
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}
