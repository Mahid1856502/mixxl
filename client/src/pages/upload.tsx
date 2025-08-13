import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Upload as UploadIcon, 
  Music, 
  Image, 
  X, 
  Play,
  Crown,
  AlertCircle,
  CheckCircle,
  Radio
} from "lucide-react";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
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

const genres = [
  "Electronic", "Hip Hop", "Pop", "Rock", "Jazz", "Classical",
  "R&B", "Country", "Folk", "Reggae", "Blues", "Indie",
  "Alternative", "Metal", "Punk", "Ambient", "House", "Techno"
];

const moods = [
  "Energetic", "Chill", "Romantic", "Melancholic", "Uplifting",
  "Aggressive", "Peaceful", "Dark", "Bright", "Mysterious"
];

export default function Upload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadForm) => {
      if (!audioFile) throw new Error("Audio file is required");
      
      const formData = new FormData();
      formData.append("track", audioFile);
      if (coverFile) formData.append("cover", coverFile);
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === "boolean" ? value.toString() : value.toString());
        }
      });

      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        setUploadProgress(progress);
      }, 500);

      try {
        const response = await fetch("/api/tracks/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "tracks"] });
      
      toast({
        title: "Track uploaded successfully!",
        description: "Your track is now live on Mixxl",
      });

      // Reset form
      form.reset();
      setAudioFile(null);
      setCoverFile(null);
      setAudioPreview(null);
      setCoverPreview(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your track",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleAudioDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith("audio/"));
    
    if (audioFile) {
      setAudioFile(audioFile);
      setAudioPreview(URL.createObjectURL(audioFile));
      
      // Auto-fill title from filename
      if (!form.getValues("title")) {
        const title = audioFile.name.replace(/\.[^/.]+$/, "");
        form.setValue("title", title);
      }
    }
  }, [form]);

  const handleCoverDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));
    
    if (imageFile) {
      setCoverFile(imageFile);
      setCoverPreview(URL.createObjectURL(imageFile));
    }
  }, []);

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      
      if (!form.getValues("title")) {
        const title = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("title", title);
      }
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: UploadForm) => {
    if (!audioFile) {
      toast({
        title: "Audio file required",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to upload tracks</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "artist") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Artist Account Required</h2>
            <p className="text-muted-foreground mb-6">
              You need an artist account to upload tracks. Switch your account type in settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.stripeSubscriptionId) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="glass-effect border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
            <CardContent className="pt-8 text-center space-y-8">
              <Crown className="w-20 h-20 mx-auto mixxl-gradient-text" />
              <div>
                <h2 className="text-3xl font-bold mb-3 mixxl-gradient-text">Unlock Your Artist Potential</h2>
                <p className="text-lg text-muted-foreground">
                  Join Mixxl's artist community and start monetizing your music with industry-leading tools
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold mixxl-gradient-text">What you get:</h3>
                  <div className="grid grid-cols-1 gap-3 text-left">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Unlimited music uploads (up to 100MB per file)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Keep 97% of all earnings (industry-leading)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Live streaming with fan tipping</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Advanced analytics & insights</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Radio playlist submissions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Direct fan messaging & engagement</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold mixxl-gradient-text">Simple Pricing</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold">£10<span className="text-lg text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground mb-2">Just 33p per day</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        90 Days Free Trial
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>✓ No setup fees</p>
                      <p>✓ Cancel anytime</p>
                      <p>✓ No long-term contracts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/subscribe'} 
                  className="w-full mixxl-gradient text-white font-semibold py-4 text-lg"
                  size="lg"
                >
                  Start Your Free Trial Today
                </Button>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => window.location.href = '/pricing-comparison'} 
                    variant="outline" 
                    className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Compare Plans
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold mixxl-gradient-text">Upload Your Track</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share your music with the world. Upload high-quality audio files and reach new fans.
          </p>
          

        </div>

        {/* Upload Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audio Upload */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span>Audio File</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!audioFile ? (
                  <div
                    className={`upload-zone p-8 text-center rounded-lg cursor-pointer transition-all ${
                      isDragOver ? "dragover" : ""
                    }`}
                    onDrop={handleAudioDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => document.getElementById("audio-input")?.click()}
                  >
                    <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Drop your audio file here</h3>
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
                      onChange={handleAudioFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-white/70" />
                        </div>
                        <div>
                          <p className="font-medium">{audioFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioPreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {audioPreview && (
                      <audio controls className="w-full">
                        <source src={audioPreview} type={audioFile.type} />
                      </audio>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Art Upload */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5" />
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
                    <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
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
                          setCoverFile(null);
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
          </div>

          {/* Track Details */}
          <div className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Track Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genres.map((genre) => (
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {moods.map((mood) => (
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                              Fans can only hear a preview until they purchase the full track
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
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
                                Submit this track for consideration in Mixxl Radio's curated playlists
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
                      disabled={!audioFile || uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Upload Track
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Use high-quality audio files (WAV/FLAC preferred)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Add cover art for better discovery</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Choose the right genre and mood</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Radio className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Submit to radio playlist for airtime consideration</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <p className="text-sm">Make sure you own the rights to the music</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
