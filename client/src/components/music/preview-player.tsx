import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  classifyPlaybackError,
  getAudioErrorMessage,
} from "@/utils/audio-utils";
import { useAudioPlayer } from "@/hooks/use-audio-manager";
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
} from "lucide-react";
import { TrackWithArtistName } from "@shared/schema";
import { useTrackAccess } from "@/api/hooks/tracks/useTrackAccess";

interface PreviewPlayerProps {
  track: TrackWithArtistName;
  onPurchase?: (trackId: string) => void;
  className?: string;
}

export default function PreviewPlayer({
  track,
  onPurchase,
  className = "",
}: PreviewPlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);
  const [audioState, setAudioState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Register with audio manager for coordination
  const playerId = `preview-${track.id}`;
  const audioPlayer = useAudioPlayer(playerId, isPlaying, () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  });

  // Check if user has access to full track
  const { data: accessInfo, isLoading: accessLoading } = useTrackAccess(
    track.id,
    user,
    track.hasPreviewOnly ?? undefined
  );

  const hasFullAccess =
    !track.hasPreviewOnly ||
    accessInfo?.hasAccess ||
    track.artistId === user?.id;
  const audioUrl = hasFullAccess
    ? track.fileUrl
    : track.previewUrl || track.fileUrl;
  const maxDuration = hasFullAccess
    ? track.duration || 0
    : track.previewDuration || 30;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);

      // Show purchase prompt when preview ends
      if (!hasFullAccess && audio.currentTime >= maxDuration - 1) {
        setShowPurchasePrompt(true);
        setIsPlaying(false);
        audio.pause();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasFullAccess) {
        setShowPurchasePrompt(true);
      }
    };

    const handleCanPlay = () => setAudioState("ready");
    const handleError = () => setAudioState("error");
    const handleLoadStart = () => setAudioState("loading");

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [hasFullAccess, maxDuration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setHasUserInteracted(true);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Request playback permission from audio manager
      const canPlay = audioPlayer.requestPlayback();
      if (!canPlay) {
        toast({
          title: "Audio busy",
          description: "Another audio is currently playing",
        });
        return;
      }

      // Wait for audio to be ready if it's still loading
      if (audioState === "loading") {
        toast({
          title: "Loading audio...",
          description: "Please wait while the audio loads",
        });
        return;
      }

      if (audioState === "error") {
        toast({
          title: "Audio error",
          description: "This audio file cannot be played",
          variant: "destructive",
        });
        return;
      }

      try {
        await audio.play();
        setIsPlaying(true);
        setShowPurchasePrompt(false);
      } catch (error) {
        const errorType = classifyPlaybackError(error);
        const errorMessage = getAudioErrorMessage(errorType);

        console.error("Playback failed:", {
          error,
          errorType,
          audioUrl,
          trackId: track.id,
          hasUserInteracted,
          audioState,
        });

        toast({
          title: errorMessage.title,
          description: errorMessage.description,
          variant: "destructive",
        });
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * maxDuration;

    audio.currentTime = Math.min(seekTime, maxDuration);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
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
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onVolumeChange={() =>
            setVolume(
              audioRef.current?.volume ? audioRef.current.volume * 100 : 70
            )
          }
        />

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
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              disabled={accessLoading}
              className="w-8 h-8 p-0"
            >
              {isPlaying ? (
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
              style={{ width: `${progressPercent}%` }}
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
