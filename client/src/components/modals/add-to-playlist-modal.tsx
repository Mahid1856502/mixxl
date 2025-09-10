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
  const { data: playlists } = useUserPlaylists(user?.id, trackId);
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

        <Input
          placeholder="Search or create playlist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />

        <div className="max-h-60 overflow-y-auto space-y-1">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
