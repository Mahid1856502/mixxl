// Audio utility functions for enhanced error handling and validation
import audioBufferToWav from "audiobuffer-to-wav";

export type PlaybackErrorType =
  | "AUTOPLAY_BLOCKED"
  | "NETWORK_ERROR"
  | "FORMAT_UNSUPPORTED"
  | "FILE_NOT_FOUND"
  | "CORS_ERROR"
  | "UNKNOWN_ERROR";

export interface PlaybackError {
  type: PlaybackErrorType;
  originalError: any;
  audioUrl?: string;
  trackId?: string;
}

export function classifyPlaybackError(error: any): PlaybackErrorType {
  if (!error) return "UNKNOWN_ERROR";

  const errorMessage = error.message?.toLowerCase() || "";
  const errorName = error.name?.toLowerCase() || "";

  // Check for autoplay policy violations
  if (
    errorMessage.includes("autoplay") ||
    errorMessage.includes("user activation") ||
    errorMessage.includes("gesture") ||
    errorName.includes("notallowederror")
  ) {
    return "AUTOPLAY_BLOCKED";
  }

  // Check for network-related errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("load") ||
    errorName.includes("networkerror")
  ) {
    return "NETWORK_ERROR";
  }

  // Check for CORS errors
  if (
    errorMessage.includes("cors") ||
    errorMessage.includes("cross-origin") ||
    errorMessage.includes("blocked")
  ) {
    return "CORS_ERROR";
  }

  // Check for format/codec issues
  if (
    errorMessage.includes("format") ||
    errorMessage.includes("codec") ||
    errorMessage.includes("decode") ||
    errorName.includes("mediaerror")
  ) {
    return "FORMAT_UNSUPPORTED";
  }

  // Check for 404/file not found
  if (errorMessage.includes("404") || errorMessage.includes("not found")) {
    return "FILE_NOT_FOUND";
  }

  return "UNKNOWN_ERROR";
}

export async function validateAudioUrl(url: string): Promise<boolean> {
  try {
    console.log("Validating audio URL:", url);
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Accept: "audio/*",
      },
    });

    console.log("Audio URL validation response:", {
      url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      console.warn(
        "Audio URL validation failed - response not ok:",
        response.status
      );
      return false;
    }

    const contentType = response.headers.get("content-type");
    const isValidAudio =
      contentType?.startsWith("audio/") ||
      contentType?.includes("mpeg") ||
      contentType?.includes("mp3") ||
      contentType?.includes("wav") ||
      contentType?.includes("m4a") ||
      false;

    console.log("Audio URL validation result:", {
      url,
      isValidAudio,
      contentType,
    });
    return isValidAudio;
  } catch (error) {
    console.error("Audio URL validation error:", error);
    return false;
  }
}

export function getAudioErrorMessage(errorType: PlaybackErrorType): {
  title: string;
  description: string;
} {
  switch (errorType) {
    case "AUTOPLAY_BLOCKED":
      return {
        title: "Tap to play",
        description: "Browser requires user interaction to start audio",
      };
    case "NETWORK_ERROR":
      return {
        title: "Connection error",
        description: "Check your internet connection and try again",
      };
    case "FORMAT_UNSUPPORTED":
      return {
        title: "Unsupported format",
        description: "This audio format is not supported by your browser",
      };
    case "FILE_NOT_FOUND":
      return {
        title: "Audio not found",
        description: "The audio file could not be located",
      };
    case "CORS_ERROR":
      return {
        title: "Access blocked",
        description: "Audio file access is restricted",
      };
    default:
      return {
        title: "Playback error",
        description: "Unable to play audio. Please try again",
      };
  }
}

export function detectUserInteraction(): boolean {
  // Check if there has been recent user interaction
  // This is a simple heuristic - in production you might want more sophisticated tracking
  return document.hasFocus() && document.visibilityState === "visible";
}

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration); // duration in seconds
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", (e) => reject(e));
  });
};

const bufferToWavBlob = (buffer: AudioBuffer) => {
  const wavArray = audioBufferToWav(buffer);
  return new Blob([wavArray], { type: "audio/wav" });
};

export const getAudioPreview = async (
  file: File,
  startSec: number,
  durationSec: number
) => {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Calculate sample range
  const startSample = Math.floor(startSec * audioBuffer.sampleRate);
  const endSample = Math.floor(
    (startSec + durationSec) * audioBuffer.sampleRate
  );

  // Create new buffer for preview
  const previewBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    endSample - startSample,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer
      .getChannelData(channel)
      .slice(startSample, endSample);
    previewBuffer.copyToChannel(channelData, channel);
  }

  // Convert buffer back to WAV/Blob (need helper)
  const wavBlob = bufferToWavBlob(previewBuffer);
  return wavBlob;
};
