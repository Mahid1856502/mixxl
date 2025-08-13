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
