import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PreviewPlayer from "./preview-player";
import PurchaseModal from "./purchase-modal";
import TipModal from "@/components/modals/tip-modal";
import {
  Play,
  Pause,
  Heart,
  Share,
  Music,
  Coins,
  Crown,
  ListMusic,
} from "lucide-react";
import { TrackExtended } from "@shared/schema";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PlaylistModal } from "../modals/add-to-playlist-modal";
import { Skeleton } from "../ui/skeleton";

interface TrackCardProps {
  track: TrackExtended;
  className?: string;
  showArtist?: boolean;
  isLoading?: boolean;
  variant?: "preview" | "card" | "recent";
}

export default function TrackCard({
  track,
  className = "",
  showArtist = true,
  variant = "preview",
}: TrackCardProps) {
  const {
    isPlaying,
    playTrack,
    pause,
    seekTo,
    isMuted,
    toggleMute,
    currentTrack,
    currentTime,
  } = useMusicPlayer();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const hasFullAccess =
    // track.isPublic ||
    !track.hasPreviewOnly || track?.hasAccess || track.artistId === user?.id;

  const maxDuration = hasFullAccess
    ? track.duration || 0
    : track.previewDuration || 30;

  const [isLiked, setIsLiked] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const playMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/tracks/${track.id}/play`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
  });

  const handlePlay = () => {
    if (currentTrack?.id === track.id && isPlaying) {
      pause?.();
    } else {
      playTrack?.(track);
      playMutation.mutate();
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from liked songs" : "Added to liked songs",
      description: track.title,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/track/${track.id}`
    );
    toast({
      title: "Link copied!",
      description: "Track link has been copied to clipboard",
    });
  };

  const handleTip = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to tip artists",
        variant: "destructive",
      });
      return;
    }
    setShowTipModal(true);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Inside TrackCard component, before the "card" variant return

  if (variant === "recent") {
    return (
      <div
        key={track.id}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
      >
        {/* Cover / Placeholder */}
        <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
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

        {/* Title + Plays */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{track.title}</p>
          <p className="text-sm text-muted-foreground">
            {(track.playCount || 0).toLocaleString()} plays
          </p>
        </div>

        {/* Play/Pause Button */}
        <Button size="icon" variant="ghost" onClick={handlePlay}>
          {currentTrack?.id === track.id && isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // If preview variant, just show the preview player
  if (variant === "preview") {
    return (
      <>
        <PreviewPlayer
          key={`preview-player-${track.id}`}
          handleOpen={handleOpen}
          currentTrack={currentTrack}
          track={track}
          onPurchase={handlePurchase}
          className={className}
          hasFullAccess={hasFullAccess}
          maxDuration={maxDuration}
          isPlaying={isPlaying}
          playTrack={playTrack}
          pause={pause}
          seekTo={seekTo}
          toggleMute={toggleMute}
          isMuted={isMuted}
          currentTime={currentTime}
        />
        <PurchaseModal
          track={showPurchaseModal ? track : null}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
        {open && (
          <PlaylistModal
            onClose={() => setOpen(false)}
            open={open}
            user={user}
            trackId={track?.id}
          />
        )}
      </>
    );
  }

  return (
    <Card
      className={`track-card group cursor-pointer ${className}`}
      key={`music-card-${track.id}`}
    >
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden rounded-t-lg">
          {track.coverImage ? (
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-16 h-16 text-white/50" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="icon"
              className="rounded-full w-12 h-12 mixxl-gradient text-white"
              onClick={handlePlay}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute gap-1 top-2 left-2 flex">
            {track.isExplicit && (
              <Badge variant="destructive" className="text-xs">
                Explicit
              </Badge>
            )}
            {track.price && (
              <Badge className="text-xs bg-green-500 hover:bg-green-600">
                £{track.price}
              </Badge>
            )}
          </div>

          {/* Duration */}
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="text-xs bg-black/50 text-white"
            >
              {track.duration ? formatDuration(track.duration) : ""}
            </Badge>
          </div>
        </div>

        {/* Track Info */}
        <div className="p-4 space-y-3">
          <div>
            <Link href={`/track/${track.id}`}>
              <h3 className="font-semibold mb-1 truncate hover:text-primary transition-colors">
                {track.title}
              </h3>
            </Link>

            {showArtist && (
              <Link href={`/profile/${track.artistId}`}>
                <p className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                  {(track as any).artistName || "Unknown Artist"}
                </p>
              </Link>
            )}

            {track.genre && (
              <Badge variant="outline" className="mt-1 text-xs">
                {track.genre}
              </Badge>
            )}
          </div>

          {/* Description */}
          {track.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {track.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{(track.playCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{(track.likesCount || 0).toLocaleString()}</span>
              </div>
            </div>
            <span>
              {track?.createdAt ? formatDate(track.createdAt.toString()) : ""}
            </span>
          </div>

          {/* Actions */}
          <div className="">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`h-8 w-8 ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-8 w-8 text-muted-foreground"
              >
                <Share className="w-4 h-4" />
              </Button>
              {hasFullAccess && (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0"
                      onClick={() => setOpen(true)}
                    >
                      <ListMusic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to playlist</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-4">
              {!hasFullAccess && (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  className="h-8 px-3 text-xs mixxl-gradient text-white"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Buy £{track.price}
                </Button>
              )}
              {user && user.id !== track.artistId && hasFullAccess && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTip}
                  className="h-8 px-3 text-xs"
                >
                  <Coins className="w-3 h-3 mr-1" />
                  Tip
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handlePlay}
                className="h-8 px-3 text-xs"
              >
                {track.id === currentTrack?.id && isPlaying ? (
                  <Pause className="w-3 h-3 mr-1" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                {track.id === currentTrack?.id && isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <PurchaseModal
        track={showPurchaseModal ? track : null}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />

      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          artist={{
            id: track.artistId,
            artistName: track.artistName || "Unknown",
            profileImage: undefined,
          }}
          track={{
            id: track.id,
            title: track.title,
          }}
        />
      )}
      {open && (
        <PlaylistModal
          onClose={() => setOpen(false)}
          open={open}
          user={user}
          trackId={track?.id}
        />
      )}
    </Card>
  );
}
