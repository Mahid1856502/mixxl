import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { classifyPlaybackError } from "@/utils/audio-utils";
import { useAudioPlayer } from "@/hooks/use-audio-manager";
import { TrackExtended } from "@shared/schema";
import { useAuth } from "./use-auth";
import * as Sentry from "@sentry/react";

interface MusicPlayerContextType {
  currentTrack: TrackExtended | null;
  currentPlaylist: TrackExtended[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  hasFullAccess: boolean;
  audioUrl: string;
  maxDuration: number;
  audioState: "loading" | "ready" | "error";

  // Actions
  playTrack: (track: TrackExtended) => void;
  playPlaylist: (tracks: TrackExtended[], startIndex?: number) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  pause: () => void;
  stop: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<TrackExtended | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<TrackExtended[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [audioState, setAudioState] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();

  // Global audio manager
  const globalAudioPlayer = useAudioPlayer("global-player", isPlaying, () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  });

  const hasFullAccess = useMemo(
    () =>
      !currentTrack?.hasPreviewOnly ||
      currentTrack?.purchaseStatus === "succeeded" ||
      currentTrack?.artistId === user?.id,
    [currentTrack, user]
  );

  const audioUrl = useMemo(
    () =>
      currentTrack
        ? hasFullAccess
          ? currentTrack.fileUrl
          : currentTrack.previewUrl || currentTrack.fileUrl
        : "",
    [currentTrack, hasFullAccess]
  );

  const maxDuration = useMemo(
    () =>
      currentTrack
        ? hasFullAccess
          ? currentTrack.duration || 0
          : currentTrack.previewDuration || 30
        : 0,
    [currentTrack, hasFullAccess]
  );

  // Play audio helper
  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      const errorType = classifyPlaybackError(error);
      Sentry.logger.info(JSON.stringify(error), { log_source: "sentry_test" });
      console.error("Audio playback failed", {
        error,
        errorType,
        track: currentTrack?.id,
      });
      setIsPlaying(false);
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers: Record<string, EventListener> = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => setDuration(audio.duration || maxDuration),
      ended: () => {
        setIsPlaying(false);
        if (
          currentPlaylist.length > 1 &&
          currentIndex < currentPlaylist.length - 1
        )
          nextTrack();
      },
      canplay: () => setAudioState("ready"),
      error: () => setAudioState("error"),
      loadstart: () => setAudioState("loading"),
    };

    Object.entries(handlers).forEach(([event, handler]) =>
      audio.addEventListener(event, handler)
    );

    return () => {
      Object.entries(handlers).forEach(([event, handler]) =>
        audio.removeEventListener(event, handler)
      );
    };
  }, [currentIndex, currentPlaylist.length, maxDuration]);

  // Volume & mute control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Update audio src & duration when track or access changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.src = audioUrl;
      setDuration(maxDuration);
    }
  }, [audioUrl, maxDuration]);

  useEffect(() => {
    if (audioState === "ready" && isPlaying) {
      playAudio();
    }
  }, [audioState, isPlaying]);

  // Track navigation helper
  const changeTrack = (newIndex: number) => {
    const track = currentPlaylist[newIndex];
    setCurrentIndex(newIndex);
    setCurrentTrack(track);
    if (isPlaying) setTimeout(playAudio, 100);
  };

  const playTrack = (track: TrackExtended) => {
    if (!globalAudioPlayer.requestPlayback()) {
      console.warn("Global player cannot start - another audio is playing");
      return;
    }

    setCurrentTrack(track);
    setCurrentPlaylist([track]);
    setCurrentIndex(0);
    setIsPlaying(true); // ✅ playback will start once audio is "ready"
  };

  const playPlaylist = (tracks: TrackExtended[], startIndex = 0) => {
    if (!tracks.length) return;

    setCurrentPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true); // ✅ wait for ready event
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!globalAudioPlayer.requestPlayback()) {
        console.warn("Global player cannot resume - another audio is playing");
        return;
      }

      setIsPlaying(true); // ✅ will auto-play once ready
    }
  };

  const nextTrack = () =>
    changeTrack((currentIndex + 1) % currentPlaylist.length);
  const previousTrack = () =>
    changeTrack(
      currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1
    );

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const contextValue = useMemo(
    () => ({
      currentTrack,
      currentPlaylist,
      currentIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      hasFullAccess,
      audioUrl,
      maxDuration,
      playTrack,
      playPlaylist,
      togglePlayPause,
      nextTrack,
      previousTrack,
      setVolume,
      toggleMute: () => setIsMuted((prev) => !prev),
      seekTo,
      pause,
      stop,
      audioState,
    }),
    [
      currentTrack,
      currentPlaylist,
      currentIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      hasFullAccess,
      audioUrl,
      maxDuration,
      audioState,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context)
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  return context;
}
