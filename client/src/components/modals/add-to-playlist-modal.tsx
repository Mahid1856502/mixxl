import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useAddTrackToPlaylist,
  useRemoveTrackFromPlaylist,
  useUserPlaylists,
} from "@/api/hooks/playlist/usePlaylist";
import { User } from "@shared/schema";
import { useCreatePlaylist } from "@/api/hooks/playlist/useCreatePlaylist";
import { Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  trackId: string; // ✅ track id from props
}

export function PlaylistModal({
  open,
  onClose,
  user,
  trackId,
}: PlaylistModalProps) {
  const { data: playlists, isLoading } = useUserPlaylists({
    identifier: user?.id,
    enabled: true,
    trackId: trackId,
  });
  const { mutate: createPlaylist, isPending: creating } = useCreatePlaylist();
  const { mutate: addTrackToPlaylist, isPending: addingTrack } =
    useAddTrackToPlaylist();
  const { mutate: removeTrackFromPlaylist, isPending: removingTrack } =
    useRemoveTrackFromPlaylist();

  const [query, setQuery] = useState("");

  const filtered = playlists?.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  const exists = playlists?.some(
    (p) => p.name.toLowerCase() === query.toLowerCase()
  );

  const handleCreate = (name: string) => {
    if (!user) return;
    createPlaylist(
      { name, creatorId: user.id },
      {
        onSuccess: (newPlaylist) => {
          addTrackToPlaylist(
            { playlistId: newPlaylist.id, trackId },
            { onSuccess: onClose }
          );
        },
      }
    );
  };

  const handleAdd = (playlistId: string) => {
    addTrackToPlaylist({ playlistId, trackId }, { onSuccess: onClose });
  };

  const handleRemove = (playlistId: string) => {
    removeTrackFromPlaylist({ playlistId, trackId }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Playlist</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3 flex justify-center items-center">
          <Input
            placeholder="Search or create playlist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1">
          {isLoading ? (
            // Skeleton state
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-7 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {filtered?.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between"
                >
                  <span>{playlist.name}</span>
                  {playlist.hasTrack ? (
                    <Button
                      onClick={() => handleRemove(playlist.id)}
                      disabled={removingTrack || addingTrack}
                      className="text-xs h-7 border border-red-500 bg-red-950 hover:bg-red-900"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleAdd(playlist.id)}
                      disabled={addingTrack || removingTrack}
                      className="text-xs h-7"
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}

              {query && !exists && (
                <Button
                  variant="default"
                  className="w-full justify-start mt-2"
                  onClick={() => handleCreate(query)}
                  disabled={creating || addingTrack}
                >
                  + Create “{query}”
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
