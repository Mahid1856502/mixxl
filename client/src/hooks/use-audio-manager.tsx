import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface AudioPlayer {
  id: string;
  pause: () => void;
  stop?: () => void;
  isPlaying: boolean;
}

interface AudioManagerContextType {
  currentPlayer: string | null;
  registerPlayer: (playerId: string, player: AudioPlayer) => void;
  unregisterPlayer: (playerId: string) => void;
  requestPlayback: (playerId: string) => boolean;
  pauseAllExcept: (playerId: string) => void;
  pauseAll: () => void;
}

const AudioManagerContext = createContext<AudioManagerContextType | undefined>(undefined);

export function AudioManagerProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const playersRef = useRef<Map<string, AudioPlayer>>(new Map());

  const registerPlayer = (playerId: string, player: AudioPlayer) => {
    playersRef.current.set(playerId, player);
  };

  const unregisterPlayer = (playerId: string) => {
    playersRef.current.delete(playerId);
    if (currentPlayer === playerId) {
      setCurrentPlayer(null);
    }
  };

  const requestPlayback = (playerId: string): boolean => {
    // Pause all other players
    pauseAllExcept(playerId);
    
    // Set as current player
    setCurrentPlayer(playerId);
    return true;
  };

  const pauseAllExcept = (exceptPlayerId: string) => {
    playersRef.current.forEach((player, id) => {
      if (id !== exceptPlayerId && player.isPlaying) {
        player.pause();
      }
    });
  };

  const pauseAll = () => {
    playersRef.current.forEach((player) => {
      if (player.isPlaying) {
        player.pause();
      }
    });
    setCurrentPlayer(null);
  };

  const value = {
    currentPlayer,
    registerPlayer,
    unregisterPlayer,
    requestPlayback,
    pauseAllExcept,
    pauseAll
  };

  return (
    <AudioManagerContext.Provider value={value}>
      {children}
    </AudioManagerContext.Provider>
  );
}

export function useAudioManager() {
  const context = useContext(AudioManagerContext);
  if (context === undefined) {
    throw new Error('useAudioManager must be used within an AudioManagerProvider');
  }
  return context;
}

// Hook for individual audio players to register themselves
export function useAudioPlayer(playerId: string, isPlaying: boolean, pause: () => void, stop?: () => void) {
  const audioManager = useAudioManager();

  const registerSelf = () => {
    audioManager.registerPlayer(playerId, {
      id: playerId,
      pause,
      stop,
      isPlaying
    });
  };

  const unregisterSelf = () => {
    audioManager.unregisterPlayer(playerId);
  };

  const requestPlayback = (): boolean => {
    return audioManager.requestPlayback(playerId);
  };

  return {
    registerSelf,
    unregisterSelf,
    requestPlayback,
    isCurrentPlayer: audioManager.currentPlayer === playerId
  };
}