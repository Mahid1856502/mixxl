"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Banner } from "@shared/schema";

interface BannerMutateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  bannerToEdit?: Partial<Banner> | null;
}

export function BannerMutateModal({
  open,
  setOpen,
  bannerToEdit,
}: BannerMutateModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [active, setActive] = useState(true);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImage(file);

        // Revoke old preview URL if any
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(file));
      }
    },
    [imagePreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // Cleanup object URLs on unmount or image change
  useEffect(() => {
    return () => {
      if (imagePreview && image) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, image]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCta("");
    setCtaUrl("");
    setImage(null);
    setImagePreview(null);
    setActive(true);
  };

  // Mutation function handles both create and update
  const bannerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("token");
      const isUpdate = Boolean(bannerToEdit?.id);

      const url = isUpdate
        ? `${BASE_URL}/api/admin/banners/${bannerToEdit?.id}`
        : `${BASE_URL}/api/admin/banners`;

      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/banners"] });

      toast({
        title: bannerToEdit ? "Banner Updated" : "Banner Created",
        description: bannerToEdit
          ? "Your banner has been successfully updated."
          : "Your banner has been successfully created.",
      });
      resetForm();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: bannerToEdit
          ? "Failed to Update Banner"
          : "Failed to Create Banner",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title || "");
      setDescription(bannerToEdit.description || "");
      setCta(bannerToEdit.cta || "");
      setCtaUrl(bannerToEdit.ctaUrl || "");
      setActive(bannerToEdit.active ?? true);
      setImage(null);

      if (bannerToEdit.imageUrl) {
        setImagePreview(`${BASE_URL}${bannerToEdit.imageUrl}`);
      } else {
        setImagePreview(null);
      }
    } else {
      resetForm();
    }
  }, [bannerToEdit, open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image && !bannerToEdit) {
      toast({
        title: "Image Required",
        description: "Please upload a banner image before submitting.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("cta", cta);
    formData.append("ctaUrl", ctaUrl);
    formData.append("active", String(active));

    if (image) {
      formData.append("image", image);
    }

    bannerMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bannerToEdit ? "Edit Banner" : "Create New Banner"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={bannerMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={bannerMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">CTA Label</Label>
            <Input
              id="cta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              disabled={bannerMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaUrl">CTA URL</Label>
            <Input
              id="ctaUrl"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              disabled={bannerMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Banner Image</Label>
            <div
              {...getRootProps()}
              className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition 
                ${
                  isDragActive
                    ? "border-purple-500 bg-gray-800"
                    : "border-gray-700 bg-gray-800/50"
                }`}
            >
              <input {...getInputProps()} disabled={bannerMutation.isPending} />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded"
                />
              ) : (
                <p className="text-center text-gray-400">
                  {isDragActive
                    ? "Drop the image here..."
                    : "Drag & drop or click to select an image"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
              disabled={bannerMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={bannerMutation.isPending}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {bannerMutation.isPending
              ? bannerToEdit
                ? "Updating..."
                : "Creating..."
              : bannerToEdit
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
