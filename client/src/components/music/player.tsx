import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Share,
  MoreHorizontal,
  Repeat,
  Shuffle
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artistId: string;
  fileUrl: string;
  coverImage?: string;
  duration?: number;
}

interface PlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export default function Player({ 
  track, 
  isPlaying, 
  onPlay, 
  onPause, 
  onNext, 
  onPrevious,
  className = ""
}: PlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTrackEnd = () => {
    if (repeat) {
      audioRef.current?.play();
    } else if (onNext) {
      onNext();
    } else {
      onPause();
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from liked songs" : "Added to liked songs",
      description: track?.title,
    });
  };

  const handleShare = () => {
    if (track) {
      navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
      toast({
        title: "Link copied!",
        description: "Track link has been copied to clipboard",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return (
      <Card className={`glass-effect border-white/10 p-4 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p>No track selected</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect border-white/10 ${className}`}>
      <audio ref={audioRef} src={track.fileUrl} preload="metadata" />
      
      <div className="p-4 space-y-4">
        {/* Track Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
            {track.coverImage ? (
              <img 
                src={track.coverImage} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 text-white/50">♪</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">Artist Name</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLike}
              className={isLiked ? "text-red-500" : "text-muted-foreground"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShuffle(!shuffle)}
              className={shuffle ? "text-primary" : "text-muted-foreground"}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              onClick={isPlaying ? onPause : onPlay}
              className="mixxl-gradient text-white w-12 h-12 rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onNext}
              disabled={!onNext}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setRepeat(!repeat)}
              className={repeat ? "text-primary" : "text-muted-foreground"}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>

        {/* Waveform visualization placeholder */}
        <div className="waveform-container">
          <div 
            className="waveform-progress" 
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
