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
  Music
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
    currentPlaylist
  } = useMusicPlayer();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (values: number[]) => {
    seekTo(values[0]);
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 glass-effect border-white/10">
      <CardContent className="p-3">
        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 w-80 min-w-0">
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
              <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artistName || "Unknown Artist"}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center space-y-2">
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={previousTrack}
                disabled={currentPlaylist.length <= 1}
                className="h-8 w-8"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button 
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full mixxl-gradient text-white"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={nextTrack}
                disabled={currentPlaylist.length <= 1}
                className="h-8 w-8"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 w-32">
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
        </div>
      </CardContent>
    </Card>
  );
}