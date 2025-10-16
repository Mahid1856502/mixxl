import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Upload as UploadIcon, Music, X } from "lucide-react";
import { Progress } from "../ui/progress";

interface AudioUploaderProps {
  audioFile?: File | null;
  setAudioFile?: (file: File | null) => void;
  progress?: number; // Optional progress prop (0–100)
  audioUrl?: string | null; // 👈 new prop for existing audio from backend
}

export default function AudioUploader({
  audioFile,
  setAudioFile,
  progress,
  audioUrl,
}: AudioUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  // 👇 Sync preview whenever file or url changes
  useEffect(() => {
    if (audioFile) {
      setAudioPreview(URL.createObjectURL(audioFile));
    } else if (audioUrl) {
      setAudioPreview(audioUrl);
    } else {
      setAudioPreview(null);
    }
  }, [audioFile, audioUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files.find((f) => f.type.startsWith("audio/"));

      if (file) {
        setAudioFile?.(file);
      }
    },
    [setAudioFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile?.(file);
    }
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Audio File</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!audioPreview ? (
          <div
            className={`upload-zone p-8 text-center rounded-lg cursor-pointer transition-all ${
              isDragOver ? "dragover" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => document.getElementById("audio-input")?.click()}
          >
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Drop your audio file here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-muted-foreground">
              Supports MP3, WAV, FLAC • Max 100MB
            </p>
            <input
              id="audio-input"
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-white/10 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white/70" />
                </div>
                <div>
                  <p className="font-medium">
                    {audioFile ? audioFile.name : "Existing audio"}
                  </p>
                  {audioFile && (
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAudioFile?.(null);
                  setAudioPreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Always keep preview */}
            {audioPreview && (
              <audio controls className="w-full">
                <source
                  src={audioPreview}
                  type={audioFile?.type || "audio/mpeg"}
                />
              </audio>
            )}

            {/* 👇 Overlay loader only when uploading */}
            {typeof progress === "number" && progress > 0 && progress < 100 && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                <Progress value={progress} className="w-40" />
                <p className="text-xs text-muted-foreground mt-2">
                  Uploading… {progress}%
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
