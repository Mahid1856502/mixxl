import { useState, useEffect } from "react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Minus,
  X,
  MoveDiagonal,
  Loader2,
} from "lucide-react";

export default function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    seekTo,
    currentPlaylist,
    pause,
    audioState,
  } = useMusicPlayer();

  console.log("currentTrack", currentTrack);
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Reset closed/minimized when playback starts again
  useEffect(() => {
    if (currentTrack && isPlaying) {
      setIsClosed(false);
      // setIsMinimized(false);
    }
  }, [currentTrack, isPlaying]);

  if (!currentTrack || isClosed) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (values: number[]) => {
    seekTo(values[0]);
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  const handleClose = () => {
    pause();
    setIsClosed(true);
  };

  // ✅ Minimized Floating Player
  if (isMinimized) {
    return (
      <Card className="fixed bottom-3 inset-x-3 md:bottom-4 md:right-4 md:left-auto md:w-80 z-50 w-full max-w-xs mx-auto rounded-2xl shadow-lg border border-white/10 glass-effect">
        <CardContent className="p-2 flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
              {currentTrack.coverImage ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-4 h-4 text-white/70" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-xs truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentTrack.artistName || "Unknown Artist"}
              </p>
            </div>
          </div>

          {/* Play/Pause + Expand */}
          <div className="flex items-center space-x-1">
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="h-8 w-8 rounded-full mixxl-gradient text-white"
            >
              {audioState === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" /> // ✅ show loader
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(false)}
            >
              <MoveDiagonal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Full Player
  return (
    <Card className="fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 glass-effect border-white/10">
      <CardContent className="p-3">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          {/* Track Info */}
          <div className="flex items-center space-x-3 w-full md:w-80 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
              {currentTrack.coverImage ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Music className="w-6 h-6 text-white/70" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artistName || "Unknown Artist"}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center space-y-2">
            {/* Control Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousTrack}
                disabled={currentPlaylist.length <= 1}
                className="h-9 w-9"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                onClick={togglePlayPause}
                className="h-12 w-12 rounded-full mixxl-gradient text-white"
              >
                {audioState === "loading" ? (
                  <Loader2 className="w-6 h-6 animate-spin" /> // ✅ show loader
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                disabled={currentPlaylist.length <= 1}
                className="h-9 w-9"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-[10px] md:text-xs text-muted-foreground w-8 md:w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-[10px] md:text-xs text-muted-foreground w-8 md:w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control (hidden on mobile, visible on md+) */}
          <div className="hidden md:flex items-center space-x-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(true)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
