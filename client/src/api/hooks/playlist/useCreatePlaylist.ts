import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertPlaylist, Playlist } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createPlaylist(data: InsertPlaylist): Promise<Playlist> {
  const response = await apiRequest("POST", "/api/playlists", data);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create playlist");
  }

  return response.json();
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: (newPlaylist) => {
      toast({ title: "Playlist created successfully" });
      queryClient.invalidateQueries({
        queryKey: ["userPlaylists", newPlaylist.creatorId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create playlist",
        variant: "destructive",
        description: error?.message,
      });
    },
  });
}

interface UpdatePlaylistInput {
  id: string;
  data: Partial<Playlist>; // since updates are partial
}

async function updatePlaylist({
  id,
  data,
}: UpdatePlaylistInput): Promise<Playlist> {
  const response = await apiRequest("PATCH", `/api/playlists/${id}`, data);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update playlist");
  }

  return response.json();
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlaylist,
    onSuccess: (updatedPlaylist) => {
      toast({ title: "Playlist updated successfully" });

      // Invalidate *all* variants of userPlaylists for this creator
      queryClient.invalidateQueries({
        queryKey: ["userPlaylists", updatedPlaylist.creatorId],
        exact: false, // 👈 ensures we invalidate nested keys
      });

      // Also nuke single playlist cache if you have it
      queryClient.invalidateQueries({
        queryKey: ["playlist", updatedPlaylist.id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update playlist",
        variant: "destructive",
        description: error?.message,
      });
    },
  });
}
