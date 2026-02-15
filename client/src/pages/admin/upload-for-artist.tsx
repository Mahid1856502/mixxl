import { useState } from "react";
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
import { Upload as UploadIcon, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { GENRES, MOODS } from "@/lib/constants";
import CoverUploader from "@/components/music/cover-uploader";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import { useAdminCreateTrack } from "@/api/hooks/admin/useAdminCreateTrack";
import AudioUploader from "@/components/music/audio-uploader";
import { getAudioDuration, getAudioPreview } from "@/utils/audio-utils";
import { useAllUsers } from "@/api/hooks/users/useAllUsers";
import { User as UserType } from "@shared/schema";

const uploadSchema = z.object({
  artistId: z.string().uuid("Select an artist"),
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
  price: z.number().min(0).optional(),
  isPublic: z.boolean().default(true),
  isExplicit: z.boolean().default(false),
  submitToRadio: z.boolean().default(false),
  hasPreviewOnly: z.boolean().default(false),
  previewDuration: z.number().min(15).max(60).default(30),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function UploadForArtist() {
  const { user } = useAuth();
  const { data: usersData, isLoading: usersLoading } = useAllUsers();
  const artists = (usersData?.users ?? []).filter(
    (u: UserType) => u.role === "artist"
  );

  const { uploadFile, isUploading, progress, fileName } = useUploadFile();
  const { mutate: createTrack, isPending } = useAdminCreateTrack();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      artistId: "",
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

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-6">
              Admin access required to upload on behalf of artists
            </p>
            <Button asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: UploadForm) => {
    if (!audioFile) {
      toast({
        title: "Audio file required",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const duration = await getAudioDuration(audioFile);

      let previewBlob: Blob | null = null;
      let previewDuration = data.previewDuration ?? 30;

      if (data.hasPreviewOnly) {
        previewDuration = Math.min(previewDuration, duration);
        previewBlob = await getAudioPreview(audioFile, 0, previewDuration);
      }

      const uploadedAudioUrl = await uploadFile(audioFile);

      let uploadedPreviewUrl: string | null = null;
      if (previewBlob) {
        const previewFile = new File([previewBlob], "preview.wav", {
          type: previewBlob.type,
          lastModified: Date.now(),
        });
        uploadedPreviewUrl = await uploadFile(previewFile);
      }

      let uploadedCoverUrl: string | null = null;
      if (coverFile) {
        uploadedCoverUrl = await uploadFile(coverFile);
      }

      const payload = {
        title: data.title,
        genre: data.genre || null,
        mood: data.mood || null,
        description: data.description || null,
        price: data.price?.toString() || null,
        artistId: data.artistId,
        fileUrl: uploadedAudioUrl,
        coverImage: uploadedCoverUrl,
        previewUrl: uploadedPreviewUrl,
        isPublic: data.isPublic,
        isExplicit: data.isExplicit,
        submitToRadio: data.submitToRadio,
        hasPreviewOnly: data.hasPreviewOnly,
        previewDuration: previewDuration || null,
        duration: Math.floor(duration),
      };

      createTrack(payload, {
        onSuccess: () => {
          const artistId = form.getValues("artistId");
          form.reset({
            artistId,
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
          });
          setAudioFile(null);
          setCoverFile(null);
        },
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Something went wrong while uploading",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Upload Track for Artist
            </h1>
            <p className="text-gray-400 mt-2">
              Upload music on behalf of an artist. The track will appear on their profile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AudioUploader
              audioUrl={null}
              audioFile={audioFile}
              setAudioFile={setAudioFile}
              progress={fileName === audioFile?.name ? progress : 0}
            />

            <CoverUploader
              coverUrl={null}
              coverFile={coverFile}
              setCoverFile={setCoverFile}
              progress={fileName === coverFile?.name ? progress : 0}
            />
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Track Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="artistId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Artist *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={usersLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select artist" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {artists.map((artist) => (
                                <SelectItem key={artist.id} value={artist.id}>
                                  {artist.fullName || artist.username} (@{artist.username})
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter track title"
                              {...field}
                              className="bg-gray-800 border-gray-700"
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
                          <FormLabel className="text-gray-300">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the track..."
                              className="bg-gray-800 border-gray-700 resize-none"
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
                          <FormLabel className="text-gray-300">Genre *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
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
                          <FormLabel className="text-gray-300">Mood</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
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
                          <FormLabel className="text-gray-300">Price (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || undefined)
                              }
                              className="bg-gray-800 border-gray-700"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-gray-300">
                              Preview Only Mode
                            </FormLabel>
                            <FormDescription className="text-xs text-gray-400">
                              Fans hear a preview until purchase
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
                            <FormLabel className="text-gray-300">
                              Preview Duration (seconds)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="15"
                                max="60"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 30)
                                }
                                className="bg-gray-800 border-gray-700"
                              />
                            </FormControl>
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-gray-300">Public Track</FormLabel>
                              <FormDescription className="text-xs text-gray-400">
                                Make track discoverable
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-gray-300">Explicit</FormLabel>
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-gray-300">
                                Submit to Radio
                              </FormLabel>
                              <FormDescription className="text-xs text-gray-400">
                                For Mixxl Radio playlists
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
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={
                        !audioFile ||
                        !form.watch("artistId") ||
                        isPending ||
                        form.formState.isSubmitting ||
                        isUploading
                      }
                    >
                      {isPending || isUploading || form.formState.isSubmitting ? (
                        <>
                          <div className="loading-spinner rounded-full w-4 h-4 mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Upload for Artist
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
