import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

type UploadResponse = {
  uploadUrl: string;
  key: string;
  fileUrl: string;
};

export function useUploadFile() {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setFileName(file.name);

      // Start loading toast
      toast.loading(`⬆️ Uploading ${file.name}`, {
        id: file.name, // ✅ use stable id to update
      });

      // 1️⃣ Get presigned URL
      const res = await apiRequest("POST", "/api/upload-url", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileUrl }: UploadResponse = await res.json();

      // 2️⃣ Upload to S3 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);

            toast.loading(`⬆️ Uploading ${file.name} (${percent}%)`, {
              id: file.name, // ✅ updates existing toast
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error uploading to S3"));
        xhr.send(file);
      });

      return fileUrl;
    },
    onSuccess: (_data, file) => {
      toast.success(`✅ ${file.name} uploaded successfully`, {
        id: file.name,
      });
    },
    onError: (err: any, file) => {
      toast.error(
        `❌ Failed to upload ${file?.name ?? "file"}: ${
          err?.message || "Something went wrong"
        }`,
        { id: file?.name }
      );
      setProgress(0);
    },
    onSettled: () => {
      setFileName(null);
      setTimeout(() => setProgress(0), 500);
    },
  });

  return {
    uploadFile: mutation.mutateAsync,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    progress,
    fileName,
  };
}
