import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Music,
  Lock,
  Clock,
  Share,
  ArrowLeft,
  Trash,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { useDeletePlaylist } from "@/api/hooks/playlist/useDeletePlaylist";

export default function PlaylistPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { playPlaylist, isPlaying, currentTrack, togglePlayPause } =
    useMusicPlayer();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch playlist details
  const { data: playlist, isLoading: playlistLoading } = useQuery({
    queryKey: ["/api/playlists", id],
    queryFn: () =>
      apiRequest("GET", `/api/playlists/${id}`).then((res) => res.json()),
    enabled: !!id,
  });

  // Fetch playlist tracks
  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ["/api/playlists", id, "tracks"],
    queryFn: () =>
      apiRequest("GET", `/api/playlists/${id}/tracks`).then((res) =>
        res.json()
      ),
    enabled: !!id,
  });

  const handlePlayAll = () => {
    if (tracks.length === 0) {
      toast({
        title: "No tracks to play",
        description: "This playlist is empty",
        variant: "destructive",
      });
      return;
    }

    // Check if we're already playing this playlist
    const isCurrentPlaylist =
      currentTrack && tracks.some((t: any) => t.id === currentTrack.id);

    if (isCurrentPlaylist && isPlaying) {
      togglePlayPause();
      toast({
        title: "Paused playlist",
        description: playlist?.name || "Playlist",
      });
    } else {
      playPlaylist(tracks, 0);
      toast({
        title: "Playing playlist",
        description: `${playlist?.name || "Playlist"} - ${
          tracks.length
        } tracks`,
      });
    }
  };

  const handlePlayTrack = (track: any, index: number) => {
    // If clicking on the currently playing track, toggle play/pause
    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
      toast({
        title: "Paused",
        description: `${track.title} by ${
          track.artistName || "Unknown Artist"
        }`,
      });
    } else {
      // Otherwise, start playing this track
      playPlaylist(tracks, index);
      // toast({
      //   title: "Now playing",
      //   description: `${track.title} by ${
      //     track.artistName || "Unknown Artist"
      //   }`,
      // });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Playlist link has been copied to clipboard",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const { mutate: deletePlaylist, isPending } = useDeletePlaylist();

  const handleDeletePlaylist = async () => {
    try {
      if (id) {
        deletePlaylist(id, {
          onSuccess: () => {
            setDeleteOpen(false);
            window.history.back();
          },
        });
      }
    } catch (err) {
      toast({
        title: "Error deleting playlist",
        variant: "destructive",
      });
    } finally {
      setDeleteOpen(false);
    }
  };

  if (playlistLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Playlist Header */}
          <Card className="glass-effect border-white/10 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
                {/* Cover Image */}
                <div className="w-48 h-48 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  {playlist.coverImage ? (
                    <img
                      src={playlist.coverImage}
                      alt={playlist.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Music className="w-20 h-20 text-white/70 mx-auto mb-2" />
                      <div className="text-sm text-white/50">
                        {playlist.trackCount} tracks
                      </div>
                    </div>
                  )}
                </div>

                {/* Playlist Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {playlist.type === "mixxlist" ? "Mixxlist" : "Playlist"}
                      </Badge>
                      {!playlist.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
                    <p className="text-muted-foreground text-lg">
                      Created by You • {formatDate(playlist.createdAt)}
                    </p>
                  </div>

                  {playlist.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {playlist.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Music className="w-4 h-4" />
                      <span>{playlist.trackCount} tracks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(playlist.totalDuration || 0)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4">
                    <Button
                      size="lg"
                      className="mixxl-gradient text-white"
                      onClick={handlePlayAll}
                      disabled={tracks.length === 0}
                    >
                      {isPlaying &&
                      currentTrack &&
                      tracks.some((t: any) => t.id === currentTrack.id) ? (
                        <Pause className="w-5 h-5 mr-2" />
                      ) : (
                        <Play className="w-5 h-5 mr-2" />
                      )}
                      {isPlaying &&
                      currentTrack &&
                      tracks.some((t: any) => t.id === currentTrack.id)
                        ? "Pause"
                        : "Play All"}
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleShare}>
                      <Share className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracks List */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Music className="w-5 h-5" />
                <span>Tracks ({tracks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tracksLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-muted rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                  <p className="text-muted-foreground">
                    This playlist is empty. Add some tracks to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tracks.map((track: any, index: number) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 text-sm text-muted-foreground text-center">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                        {track.coverImage ? (
                          <img
                            src={track.coverImage}
                            alt={track.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-white/70" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artistName || "Unknown Artist"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {track.duration
                          ? `${Math.floor(track.duration / 60)}:${String(
                              track.duration % 60
                            ).padStart(2, "0")}`
                          : "--:--"}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayTrack(track, index)}
                      >
                        {isPlaying && currentTrack?.id === track.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Playlist"
        description={
          <>
            Are you sure you want to delete the playlist{" "}
            <strong>{playlist?.name || "Untitled"}</strong>? This action cannot
            be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePlaylist}
        isPending={isPending} // Replace with your loading state if you have one
      />
    </div>
  );
}
