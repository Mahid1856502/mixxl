import { useEffect, useState } from "react";
import { useAuth } from "@/provider/use-auth";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload as UploadIcon, Play, Radio } from "lucide-react";
import { useLocation, useParams } from "wouter";
import UploadTips from "@/components/music/upload-tips";
import { GENRES, MOODS } from "@/lib/constants";
import CoverUploader from "@/components/music/cover-uploader";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import { useCreateTrack, useUpdateTrack } from "@/api/hooks/tracks/useTracks";
import AudioUploader from "@/components/music/audio-uploader";
import { getAudioDuration, getAudioPreview } from "@/utils/audio-utils";
import { useTrack } from "@/api/hooks/tracks/useMyTracks";

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  genre: z.string().min(1, "Genre is required"),
  mood: z.string().optional(),
  price: z.number().min(0).max(1000).optional(),
  isPublic: z.boolean().default(true),
  isExplicit: z.boolean().default(false),
  submitToRadio: z.boolean().default(false),
  hasPreviewOnly: z.boolean().default(false),
  previewDuration: z.number().min(15).max(60).default(30),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function Upload() {
  const { user } = useAuth();
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: track } = useTrack(id);

  console.log("track", track);
  const { uploadFile, isUploading, progress, fileName } = useUploadFile();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { mutate: uploadTrack, isPending } = useCreateTrack();
  const { mutate: updateTrack, isPending: isUpdating } = useUpdateTrack();

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      mood: "",
      price: undefined,
      isPublic: true,
      isExplicit: false,
      submitToRadio: false,
      hasPreviewOnly: false,
      previewDuration: 30,
    },
  });

  useEffect(() => {
    if (track) {
      form.reset({
        title: track.title ?? "",
        description: track.description ?? "",
        genre: track.genre ?? "",
        mood: track.mood ?? "",
        price: track.price ? parseFloat(track.price) : undefined, // cast string -> number
        isPublic: track.isPublic ?? true,
        isExplicit: track.isExplicit ?? false,
        submitToRadio: track.submitToRadio ?? false,
        hasPreviewOnly: track.hasPreviewOnly ?? false,
        previewDuration: track.previewDuration ?? 30,
      });
    }
  }, [track, form]);
  console.log("watch", form.watch());

  if (!user || user.role !== "artist") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in as an artist to upload tracks
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: UploadForm) => {
    if (!audioFile && !track?.fileUrl) {
      toast({
        title: "Audio file required",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1️⃣ Get audio duration
      let duration = track?.duration ?? 0;
      if (audioFile) {
        duration = await getAudioDuration(audioFile);
      }

      debugger;
      // 2️⃣ Handle preview if requested
      let previewBlob: Blob | null = null;
      let previewDuration = track?.previewDuration ?? 0;

      if (data.hasPreviewOnly) {
        previewDuration = Math.min(data.previewDuration || 30, duration);

        const durationChanged = previewDuration !== track?.previewDuration;
        const needsNewPreview =
          audioFile || !track?.previewUrl || durationChanged;

        if (needsNewPreview) {
          let sourceFile: File | null = audioFile ?? null;

          if (!sourceFile && track?.fileUrl) {
            const response = await fetch(track.fileUrl);
            const blob = await response.blob();
            sourceFile = new File([blob], "existing_audio.wav", {
              type: blob.type || "audio/wav",
              lastModified: Date.now(),
            });
          }

          if (sourceFile) {
            previewBlob = await getAudioPreview(sourceFile, 0, previewDuration);
          }
        }
      }

      // 3️⃣ Upload assets (only if new ones provided)
      let uploadedAudioKey = track?.fileUrl ?? null;
      if (audioFile) {
        uploadedAudioKey = await uploadFile(audioFile);
      }

      let uploadedPreviewKey = track?.previewUrl ?? null;
      if (previewBlob) {
        const previewFile = new File([previewBlob], "preview.wav", {
          type: previewBlob.type,
          lastModified: Date.now(),
        });
        uploadedPreviewKey = await uploadFile(previewFile);
      }

      let uploadedCoverKey = track?.coverImage ?? null;
      if (coverFile) {
        uploadedCoverKey = await uploadFile(coverFile);
      }

      // 4️⃣ Build payload
      const payload = {
        title: data.title,
        genre: data.genre || null,
        mood: data.mood || null,
        description: data.description || null,
        price: data.price?.toString() || null,
        artistId: user.id,
        fileUrl: uploadedAudioKey ?? "",
        coverImage: uploadedCoverKey ?? null,
        previewUrl: uploadedPreviewKey ?? null,
        isPublic: data.isPublic,
        isExplicit: data.isExplicit,
        submitToRadio: data.submitToRadio,
        hasPreviewOnly: data.hasPreviewOnly,
        previewDuration: previewDuration || null,
        duration: Math.floor(duration),
      };

      // 5️⃣ Call correct API
      if (track) {
        updateTrack(
          { ...track, ...payload },
          {
            onSuccess: () => {
              form.reset();
              setLocation(`/profile/${user?.id}`);
            },
          }
        );
      } else {
        uploadTrack(payload, {
          onSuccess: () => {
            form.reset();
            setLocation(`/profile/${user?.id}`);
          },
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Something went wrong while uploading your track",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (
      user?.subscriptionStatus !== "lifetime_free" &&
      (!user?.stripeSubscriptionId || user?.subscriptionStatus === "canceled")
    ) {
      setLocation("/subscribe");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen p-6 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold mixxl-gradient-text">
            Upload Your Track
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share your music with the world. Upload high-quality audio files and
            reach new fans.
          </p>
        </div>

        {/* Upload Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audio Upload */}
          <div className="lg:col-span-2 space-y-6">
            <AudioUploader
              audioUrl={track?.fileUrl || null}
              audioFile={audioFile}
              setAudioFile={setAudioFile}
              progress={fileName === audioFile?.name ? progress : 0}
            />

            <CoverUploader
              coverUrl={track?.coverImage || null}
              coverFile={coverFile}
              setCoverFile={setCoverFile}
              progress={fileName === coverFile?.name ? progress : 0}
            />
            <UploadTips />
          </div>

          {/* Track Details */}
          <div className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Track Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter track title"
                              {...field}
                              className="bg-white/5 border-white/10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your track..."
                              className="bg-white/5 border-white/10 resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GENRES.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MOODS.map((mood) => (
                                <SelectItem key={mood} value={mood}>
                                  {mood}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1000"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                              className="bg-white/5 border-white/10"
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for free track
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasPreviewOnly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center space-x-2">
                              <Play className="w-4 h-4 text-purple-500" />
                              <span>Preview Only Mode</span>
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Fans can only hear a preview until they purchase
                              the full track
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("hasPreviewOnly") && (
                      <FormField
                        control={form.control}
                        name="previewDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preview Duration (seconds)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="15"
                                max="60"
                                placeholder="30"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 30)
                                }
                                className="bg-white/5 border-white/10"
                              />
                            </FormControl>
                            <FormDescription>
                              How long fans can preview (15-60 seconds)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Public Track</FormLabel>
                              <FormDescription className="text-xs">
                                Make track discoverable by other users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isExplicit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Explicit Content</FormLabel>
                              <FormDescription className="text-xs">
                                Contains explicit lyrics or content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="submitToRadio"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Radio className="w-4 h-4 text-green-500" />
                                <span>Submit to Radio Playlist</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Submit this track for consideration in Mixxl
                                Radio's curated playlists
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full mixxl-gradient text-white font-semibold"
                      disabled={
                        (!audioFile && !track?.fileUrl) || // ✅ allow if editing and existing fileUrl is available
                        isPending ||
                        form.formState.isSubmitting ||
                        isUploading ||
                        isUpdating
                      }
                    >
                      {isPending ||
                      isUploading ||
                      isUpdating ||
                      form.formState.isSubmitting ? (
                        <>
                          <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
                          {track ? "Updating..." : "Uploading..."}
                        </>
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4 mr-2" />
                          {track ? "Update Track" : "Upload Track"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
