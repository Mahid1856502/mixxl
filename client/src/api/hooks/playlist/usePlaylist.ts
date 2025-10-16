import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Playlist } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiscoverFilters } from "../artists/useArtists";
// Types
export interface PlaylistWithFlag extends Playlist {
  hasTrack?: boolean; // present only if trackId is passed
}

// API fetcher
async function fetchPlaylists(
  identifier: string,
  trackId?: string
): Promise<PlaylistWithFlag[]> {
  const url = trackId
    ? `/api/users/${identifier}/playlists?trackId=${trackId}`
    : `/api/users/${identifier}/playlists`;

  const res = await apiRequest("GET", url);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlists");
  }

  return res.json();
}

// Hook
export function useUserPlaylists({
  identifier,
  enabled,
  trackId,
}: {
  identifier: string | undefined;
  enabled?: boolean;
  trackId?: string;
}) {
  return useQuery({
    queryKey: ["userPlaylists", identifier, trackId, enabled], // include trackId in key
    queryFn: () => fetchPlaylists(identifier!, trackId),
    enabled: !!identifier && !!enabled, // only fetch if identifier is defined
  });
}

export function usePublicPlaylists(filters: DiscoverFilters = {}) {
  return useQuery<Playlist[], Error>({
    queryKey: ["playlists", filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>);
      const url = `/api/playlists${query.toString() ? `?${query}` : ""}`;
      const res = await apiRequest("GET", url);
      // const res = await apiRequest("GET", "/api/playlists");
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
      toast({
        title: "Track added to playlist",
      });
      // invalidate so playlists update with new track
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
    onError: (_data, variables) => {
      toast({
        title: "Track failed to add in playlist",
      });
    },
  });
}

interface RemoveTrackPayload {
  playlistId: string;
  trackId: string;
}

async function removeTrackFromPlaylist({
  playlistId,
  trackId,
}: RemoveTrackPayload) {
  const res = await apiRequest(
    "DELETE",
    `/api/playlists/${playlistId}/tracks/${trackId}`
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Failed to remove track from playlist"
    );
  }

  return res.json();
}

export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTrackFromPlaylist,
    onSuccess: (_data, variables) => {
      toast({
        title: "Track removed to playlist",
      });
      // invalidate all playlists and specifically the one updated
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      queryClient.invalidateQueries({
        queryKey: ["playlist", variables.playlistId],
      });
    },
    onError: (_data, variables) => {
      toast({
        title: "Track failed to remove from playlist",
      });
    },
  });
}

export function useGetPlaylistById(id: string) {
  return useQuery<Playlist, Error>({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/playlists/${id}`);
      if (!res.ok) throw new Error("Failed to fetch playlist");
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
