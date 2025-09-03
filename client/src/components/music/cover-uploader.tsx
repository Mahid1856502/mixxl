// src/components/CoverUploader.tsx
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface CoverUploaderProps {
  coverFile?: File | null;
  setCoverFile?: (coverFile: File | null) => void;
}

export default function CoverUploader({
  coverFile,
  setCoverFile,
}: CoverUploaderProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleCoverDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));
      if (imageFile) {
        setCoverFile?.(imageFile);
        setCoverPreview(URL.createObjectURL(imageFile));
      }
    },
    [setCoverFile]
  );

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile?.(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Cover Art (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!coverFile ? (
          <div
            className="upload-zone p-6 text-center rounded-lg cursor-pointer border-dashed"
            onDrop={handleCoverDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("cover-input")?.click()}
          >
            <p className="text-sm text-muted-foreground mb-2">
              Drop cover art here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Recommended: 1000x1000px, JPG or PNG
            </p>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="aspect-square w-32 mx-auto relative">
              <img
                src={coverPreview || ""}
                alt="Cover preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6"
                onClick={() => {
                  setCoverFile?.(null);
                  setCoverPreview(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {coverFile.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
