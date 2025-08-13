import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { classifyPlaybackError, validateAudioUrl, getAudioErrorMessage, detectUserInteraction } from '@/utils/audio-utils';
import { useAudioPlayer } from '@/hooks/use-audio-manager';

interface Track {
  id: string;
  title: string;
  artistName?: string;
  fileUrl?: string;
  previewUrl?: string;
  coverImage?: string;
  hasPreviewOnly?: boolean;
  duration?: number;
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  currentPlaylist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  
  // Actions
  playTrack: (track: Track) => void;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  pause: () => void;
  stop: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [audioState, setAudioState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Register with audio manager for coordination
  const globalAudioPlayer = useAudioPlayer(
    'global-player',
    isPlaying,
    () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
    }
  );

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track in playlist if available
      if (currentPlaylist.length > 1 && currentIndex < currentPlaylist.length - 1) {
        nextTrack();
      }
    };
    const handleCanPlay = () => setAudioState('ready');
    const handleError = () => setAudioState('error');
    const handleLoadStart = () => setAudioState('loading');

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentIndex, currentPlaylist.length]);

  // Update audio source when track changes with validation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const audioUrl = currentTrack.hasPreviewOnly && !currentTrack.previewUrl 
      ? currentTrack.fileUrl 
      : currentTrack.previewUrl || currentTrack.fileUrl;
    
    if (audioUrl) {
      setAudioState('loading');
      
      // Validate audio URL before setting
      validateAudioUrl(audioUrl).then(isValid => {
        if (isValid) {
          audio.src = audioUrl;
          audio.volume = volume / 100;
          audio.muted = isMuted;
        } else {
          setAudioState('error');
          console.error('Invalid audio URL:', audioUrl);
        }
      }).catch(() => {
        setAudioState('error');
      });
    }
  }, [currentTrack, volume, isMuted]);

  // Control volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // Control mute
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted]);

  const playTrack = async (track: Track) => {
    setHasUserInteracted(true);
    
    // Request playback permission from audio manager
    const canPlay = globalAudioPlayer.requestPlayback();
    if (!canPlay) {
      console.warn('Global player cannot start - another audio is playing');
      return;
    }
    
    setCurrentTrack(track);
    setCurrentPlaylist([track]);
    setCurrentIndex(0);
    
    setTimeout(async () => {
      const audio = audioRef.current;
      if (audio && audioState === 'ready') {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          const errorType = classifyPlaybackError(error);
          console.error('Global player failed:', { error, errorType, track: track.id });
          setIsPlaying(false);
        }
      }
    }, 100);
  };

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    
    setCurrentPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
    
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.play().catch(console.error);
      }
    }, 100);
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setHasUserInteracted(true);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Request playback permission from audio manager
      const canPlay = globalAudioPlayer.requestPlayback();
      if (!canPlay) {
        console.warn('Global player cannot resume - another audio is playing');
        return;
      }
      
      if (audioState !== 'ready') {
        console.warn('Audio not ready for playback:', audioState);
        return;
      }
      
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        const errorType = classifyPlaybackError(error);
        console.error('Global player toggle failed:', { error, errorType, track: currentTrack.id });
        setIsPlaying(false);
      }
    }
  };

  const nextTrack = () => {
    if (currentPlaylist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrack(currentPlaylist[nextIndex]);
    
    if (isPlaying) {
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().catch(console.error);
        }
      }, 100);
    }
  };

  const previousTrack = () => {
    if (currentPlaylist.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentTrack(currentPlaylist[prevIndex]);
    
    if (isPlaying) {
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().catch(console.error);
        }
      }, 100);
    }
  };

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

  const contextValue: MusicPlayerContextType = {
    currentTrack,
    currentPlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    playPlaylist,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute: () => setIsMuted(!isMuted),
    seekTo,
    pause,
    stop
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}