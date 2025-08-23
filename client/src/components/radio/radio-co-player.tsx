import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
} from "lucide-react";

interface RadioCoPlayerProps {
  isLive?: boolean;
  listenerCount?: number;
  stationName?: string;
  className?: string;
}

export default function RadioCoPlayer({
  isLive = false,
  listenerCount = 0,
  stationName = "Mixxl Radio",
  className = "",
}: RadioCoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Radio.co stream URL - your actual streaming endpoint
  const RADIO_CO_STREAM_URL = "https://streaming.radio.co/se0840272e/listen";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (isMuted && newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setIsLoading(false);
    console.error("Radio stream error");
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card className={`glass-effect border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-primary" />
            <span>{stationName}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <Badge variant="destructive" className="bg-red-500 animate-pulse">
                LIVE
              </Badge>
            )}
            {listenerCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {listenerCount} listening
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hidden audio element for Radio.co stream */}
        <audio
          ref={audioRef}
          src={RADIO_CO_STREAM_URL}
          preload="none"
          onError={handleAudioError}
          onEnded={handleAudioEnded}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />

        {/* Live indicator and current status */}
        <div className="text-center space-y-3">
          {isLive ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
              <span className="text-sm font-medium">Broadcasting Live</span>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No live broadcast</p>
            </div>
          )}

          {/* Stream URL link */}
          <div className="text-xs text-muted-foreground">
            <a
              href={RADIO_CO_STREAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-primary transition-colors"
            >
              <span>Direct Stream</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Player controls */}
        <div className="space-y-4">
          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePlay}
              disabled={isLoading}
              className="mixxl-gradient text-white w-16 h-16 rounded-full"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="flex-shrink-0"
            >
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />

            <span className="text-xs text-muted-foreground w-8 text-right">
              {isMuted ? 0 : volume[0]}
            </span>
          </div>
        </div>

        {/* Broadcasting info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Powered by Radio.co</p>
          <p className="font-mono text-[10px] opacity-50">
            se0840272e.dj.radio.co
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
