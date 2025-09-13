import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingCart,
  Lock,
  Crown,
  ListMusic,
} from "lucide-react";
import { TrackExtended } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface PreviewPlayerProps {
  handleOpen: () => void;
  track: TrackExtended;
  currentTrack: TrackExtended | null;
  onPurchase?: (trackId: string) => void;
  className?: string;
  hasFullAccess: boolean;
  maxDuration: number;
  isPlaying: boolean;
  playTrack: (track: TrackExtended) => void;
  pause: () => void;
  seekTo: (time: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentTime: number;
}

export default function PreviewPlayer({
  handleOpen,
  track,
  currentTrack,
  onPurchase,
  className = "",
  hasFullAccess,
  maxDuration,
  isPlaying,
  playTrack,
  pause,
  seekTo,
  isMuted,
  toggleMute,
  currentTime,
}: PreviewPlayerProps) {
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);

  const handlePlay = () => {
    if (isPlaying) {
      pause?.();
    } else {
      playTrack?.(track);
    }
  };
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * maxDuration;

    seekTo(seekTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(track.id);
    }
  };

  const progressPercent =
    maxDuration > 0 ? (currentTime / maxDuration) * 100 : 0;

  return (
    <Card className={`glass-effect border-white/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Album Art */}
          <div className="relative">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              {track.coverImage ? (
                <img
                  src={track.coverImage}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white/50" />
                </div>
              )}
            </div>

            {!hasFullAccess && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <Lock className="w-3 h-3" />
                </Badge>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{track.title}</h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {!hasFullAccess && (
                <Badge variant="outline" className="text-xs">
                  Preview {track.previewDuration || 30}s
                </Badge>
              )}
              {track.price && Number(track?.price) > 0 && (
                <span className="text-green-400">£{track.price}</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {hasFullAccess && (
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0"
                    onClick={handleOpen}
                  >
                    <ListMusic className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to playlist</TooltipContent>
              </Tooltip>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlay}
              className="w-8 h-8 p-0"
            >
              {track?.id === currentTrack?.id && isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="w-8 h-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            {!hasFullAccess && track.price && Number(track.price) > 0 && (
              <Button
                size="sm"
                onClick={handlePurchase}
                className="mixxl-gradient text-white"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy £{track.price}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <div
            className="w-full h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150"
              style={{
                width: `${
                  currentTrack?.id === track.id ? progressPercent : 0
                }%`,
              }}
            />
            {!hasFullAccess && (
              <div
                className="absolute top-0 right-0 h-full bg-red-500/30 border-l-2 border-red-500"
                style={{
                  width: `${
                    100 - (maxDuration / (track.duration || maxDuration)) * 100
                  }%`,
                }}
              />
            )}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
        </div>

        {/* Purchase Prompt */}
        {showPurchasePrompt && !hasFullAccess && (
          <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Preview ended</p>
                <p className="text-xs text-muted-foreground">
                  Purchase to hear the full track
                </p>
              </div>
              {track.price && Number(track.price) > 0 && (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  className="mixxl-gradient text-white"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Buy £{track.price}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
