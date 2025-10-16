import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserTracks } from "@/api/hooks/tracks/useMyTracks";
import { useAuth } from "@/hooks/use-auth";
import AlbumTracks from "@/components/music/album-tracks";
import CoverUploader from "@/components/music/cover-uploader";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import { Switch } from "@/components/ui/switch";
import { InsertAlbum, insertAlbumSchema, Track } from "@shared/schema";
import {
  useAlbum,
  useCreateAlbum,
  useUpdateAlbum,
} from "@/api/hooks/tracks/useAlbums";
import { useLocation, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateAlbumForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // --- Local UI state ---
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { data: album, isLoading } = useAlbum(id);
  console.log("album", album);
  const { user } = useAuth();
  const { uploadFile, isUploading, progress, fileName } = useUploadFile();
  const { mutate: createAlbum, isPending } = useCreateAlbum();
  const { mutate: updateAlbum, isPending: isUpdating } = useUpdateAlbum();
  const { data: userTracks = [], isLoading: tracksLoading } = useUserTracks(
    true,
    user?.id
  );
  const [, setLocation] = useLocation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<InsertAlbum>({
    resolver: zodResolver(insertAlbumSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      isPublic: true,
      tracks: [],
    },
  });

  const {
    fields: trackFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: "tracks",
  });

  useEffect(() => {
    if (album && isEditMode) {
      reset({
        title: album.title ?? "",
        description: album.description ?? "",
        price: album.price?.toString() ?? "",
        isPublic: album.isPublic ?? true,
        tracks:
          album.tracks?.map((t: any, i: number) => ({
            trackId: t.id,
            trackNumber: i + 1,
          })) ?? [],
      });
    }
  }, [album, isEditMode, reset]);

  // Submit handler
  async function onSubmit(values: InsertAlbum) {
    const uploadedCoverKey = coverFile
      ? await uploadFile(coverFile)
      : undefined;

    const payload = {
      ...values,
      coverImage: uploadedCoverKey ?? album?.coverImage,
      tracks: values.tracks.map((t, i) => ({
        ...t,
        trackNumber: i + 1,
      })),
    };

    if (isEditMode) {
      updateAlbum({ id, data: payload });
    } else {
      createAlbum(payload);
    }
  }

  if (isEditMode && isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1 text-center mt-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto mt-2" />
        </div>

        {/* Album Details Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Skeleton */}
        <Skeleton className="h-52 w-full rounded-lg" />

        {/* Tracks Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1 text-center mt-3">
        <h1 className="text-3xl font-bold mixxl-gradient-text">
          Release New Album
        </h1>
        <p className="text-muted-foreground">
          Upload tracks, set price, and publish an album.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Album Details */}
        <Card>
          <CardHeader>
            <CardTitle>Album Details</CardTitle>
            <CardDescription>Title, description & pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("title")} placeholder="Album title" />
              {errors.title && (
                <p className="text-sm text-red-500 mt-3">
                  {String(errors.title?.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Short description / credits"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (£)</Label>
                <Input {...register("price")} placeholder="8.00" />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-3">
                    {String(errors.price?.message)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Switch
                  id="isPublic"
                  disabled={
                    isSubmitting || isUploading || isPending || isUpdating
                  }
                  checked={watch("isPublic") ?? false}
                  onCheckedChange={(checked) => setValue("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Public Album</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Upload */}
        <CoverUploader
          coverUrl={album?.coverImage || null}
          coverFile={coverFile}
          setCoverFile={setCoverFile}
          progress={fileName === coverFile?.name ? progress : 0}
        />

        <AlbumTracks
          errors={errors}
          userTracks={userTracks}
          fields={trackFields}
          append={append}
          remove={remove}
          move={move}
          tracksLoading={tracksLoading}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isSubmitting || isUploading || isPending || isUpdating}
            onClick={() => {
              reset();
              setCoverFile(null);
              setLocation("/profile?tab=albums"); // Redirect to profile or another appropriate page
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting || isUploading || isPending || isUpdating}
          >
            Create Album
          </Button>
        </div>
      </form>
    </div>
  );
}
