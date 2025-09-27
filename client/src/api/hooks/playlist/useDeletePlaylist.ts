import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Playlist } from "@shared/schema";

interface DeletePlaylistResponse {
  message: string;
  deletedPlaylist: Playlist;
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation<DeletePlaylistResponse, Error, string>({
    mutationFn: async (playlistId: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/playlists/${playlistId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete playlist");
      }

      // Assume backend returns JSON with success status
      return response.json();
    },

    onSuccess: (data) => {
      // If you have a query for the single playlist, invalidate it as well
      queryClient.invalidateQueries({
        queryKey: ["playlist", data.deletedPlaylist?.id],
      });

      // If you have userPlaylists query
      queryClient.invalidateQueries({
        queryKey: ["userPlaylists", data.deletedPlaylist?.creatorId],
      });
    },

    onError: (error) => {
      console.error("Delete playlist error:", error);
    },
  });
}
