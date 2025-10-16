"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertPlaylist, insertPlaylistSchema } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  useCreatePlaylist,
  useUpdatePlaylist,
} from "@/api/hooks/playlist/useCreatePlaylist";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { useGetPlaylistById } from "@/api/hooks/playlist/usePlaylist";
import { useEffect } from "react";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId?: string;
}

export function CreatePlaylistModal({
  playlistId,
  open,
  onOpenChange,
}: CreatePlaylistModalProps) {
  const { user: currentUser } = useAuth();
  const isEditMode = Boolean(playlistId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<InsertPlaylist>({
    resolver: zodResolver(insertPlaylistSchema),
    defaultValues: {
      name: "",
      description: "",
      creatorId: "",
      isPublic: true,
      coverImage: "",
      type: "playlist",
    },
  });

  // ✅ fetch playlist data if editing
  const { data: existingPlaylist } = useGetPlaylistById(playlistId!);

  useEffect(() => {
    if (currentUser) setValue("creatorId", currentUser.id);
  }, [currentUser, setValue]);

  useEffect(() => {
    if (existingPlaylist && isEditMode) {
      reset(existingPlaylist); // prefill form with existing values
    }
  }, [existingPlaylist, isEditMode, reset]);

  const type = watch("type");

  const { mutate: createPlaylist, isPending: isCreating } = useCreatePlaylist();
  const { mutate: updatePlaylist, isPending: isUpdating } = useUpdatePlaylist();

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: InsertPlaylist) => {
    if (!currentUser?.id) {
      toast({
        title: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updatePlaylist(
        { id: playlistId!, data },
        {
          onSuccess: () => {
            toast({ title: "Playlist updated successfully" });
            reset();
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast({
              title: "Failed to update playlist",
              description: err?.message || "Something went wrong",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createPlaylist(data, {
        onSuccess: () => {
          toast({ title: "Playlist created successfully" });
          reset();
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create playlist",
            description: err?.message || "Something went wrong",
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {isEditMode ? "Edit Playlist" : "Create New Playlist"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of your playlist."
              : "Fill out the form below to create a new playlist."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Playlist name"
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Playlist description"
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Is Public */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              {...register("isPublic")}
              disabled={isPending}
            />
            <Label htmlFor="isPublic">Public Playlist</Label>
          </div>

          {/* Cover Image */}
          <div className="space-y-1">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              {...register("coverImage")}
              placeholder="https://..."
              disabled={isPending}
            />
            {errors.coverImage && (
              <p className="text-red-600 text-sm mt-1">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type ?? undefined}
              onValueChange={(val) => setValue("type", val)}
              disabled={isPending}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select playlist type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playlist">Playlist</SelectItem>
                <SelectItem value="mixxlist">Mixxlist</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Playlist"
                : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
