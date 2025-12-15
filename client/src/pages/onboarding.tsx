import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/provider/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Music,
  Heart,
  Users,
  Globe,
  Settings,
  CheckCircle,
  Star,
  Radio,
  Upload,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { GENRES } from "@/lib/constants";

// Welcome Step Schema
const welcomeSchema = z.object({
  acknowledged: z.boolean().default(true),
});

// Profile Step Schema
const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

// Preferences Step Schema
const preferencesSchema = z.object({
  genres: z.array(z.string()).min(1, "Please select at least one genre"),
  influences: z.string().optional(),
  listenGoals: z.array(z.string()).optional(),
});

// Privacy Step Schema
const privacySchema = z.object({
  profileVisibility: z.enum(["public", "friends", "private"]).default("public"),
  allowMessages: z.boolean().default(true),
  allowTips: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

// Artist-specific Step Schema
const artistSchema = z.object({
  artistName: z.string().min(2, "Artist name must be at least 2 characters"),
  genres: z.array(z.string()).min(1, "Please select at least one genre"),
  experience: z.enum(["beginner", "intermediate", "professional", "veteran"]),
  goals: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      spotify: z.string().optional(),
    })
    .optional(),
});

// Final Step Schema
const finalSchema = z.object({
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
  subscribedToNewsletter: z.boolean().default(false),
});

const LISTEN_GOALS = [
  "Discover new artists",
  "Support independent music",
  "Build playlists",
  "Connect with musicians",
  "Find local artists",
  "Explore new genres",
];

const ARTIST_GOALS = [
  "Build a fanbase",
  "Earn from music",
  "Collaborate with others",
  "Get feedback on music",
  "Network with industry",
  "Launch a music career",
];

type WelcomeData = z.infer<typeof welcomeSchema>;
type ProfileData = z.infer<typeof profileSchema>;
type PreferencesData = z.infer<typeof preferencesSchema>;
type PrivacyData = z.infer<typeof privacySchema>;
type ArtistData = z.infer<typeof artistSchema>;
type FinalData = z.infer<typeof finalSchema>;

export default function Onboarding() {
  const [, params] = useRoute("/onboarding");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userRole, setUserRole] = useState<"fan" | "artist">("fan");

  // Form data storage
  const [formData, setFormData] = useState<{
    welcome?: WelcomeData;
    profile?: ProfileData;
    preferences?: PreferencesData;
    privacy?: PrivacyData;
    artist?: ArtistData;
    final?: FinalData;
  }>({});

  // Check if restarting from setup-role page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("restart") === "true") {
      setCurrentStep(1);
    }
  }, []);

  const totalSteps = userRole === "artist" ? 6 : 5;
  const progress = (currentStep / totalSteps) * 100;

  // Individual form instances
  const welcomeForm = useForm<WelcomeData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: formData.welcome || {
      acknowledged: true,
    },
  });

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: formData.profile || {
      displayName: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  const preferencesForm = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      genres: formData.preferences?.genres || [],
      influences: formData.preferences?.influences || "",
      listenGoals: formData.preferences?.listenGoals || [],
    },
  });

  const privacyForm = useForm<PrivacyData>({
    resolver: zodResolver(privacySchema),
    defaultValues: formData.privacy || {
      profileVisibility: "public",
      allowMessages: true,
      allowTips: true,
      emailNotifications: true,
    },
  });

  const artistForm = useForm<ArtistData>({
    resolver: zodResolver(artistSchema),
    defaultValues: formData.artist || {
      artistName: "",
      genres: [],
      experience: undefined,
      goals: [],
      socialLinks: {
        instagram: "",
        twitter: "",
        youtube: "",
        spotify: "",
      },
    },
  });

  const finalForm = useForm<FinalData>({
    resolver: zodResolver(finalSchema),
    defaultValues: formData.final || {
      agreedToTerms: false,
      subscribedToNewsletter: false,
    },
  });

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        // Welcome step doesn't need validation, just proceed
        isValid = true;
        setFormData((prev) => ({ ...prev, welcome: { acknowledged: true } }));
        setUserRole("fan"); // Default role, can be changed later
        break;
      case 2:
        isValid = await profileForm.trigger();
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            profile: profileForm.getValues(),
          }));
        }
        break;
      case 3:
        isValid = await preferencesForm.trigger();
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            preferences: preferencesForm.getValues(),
          }));
        }
        break;
      case 4:
        if (userRole === "artist") {
          isValid = await artistForm.trigger();
          if (isValid) {
            setFormData((prev) => ({
              ...prev,
              artist: artistForm.getValues(),
            }));
          }
        } else {
          isValid = await privacyForm.trigger();
          if (isValid) {
            setFormData((prev) => ({
              ...prev,
              privacy: privacyForm.getValues(),
            }));
          }
        }
        break;
      case 5:
        if (userRole === "artist") {
          isValid = await privacyForm.trigger();
          if (isValid) {
            setFormData((prev) => ({
              ...prev,
              privacy: privacyForm.getValues(),
            }));
          }
        } else {
          isValid = await finalForm.trigger();
          if (isValid) {
            setFormData((prev) => ({ ...prev, final: finalForm.getValues() }));
          }
        }
        break;
      case 6:
        isValid = await finalForm.trigger();
        if (isValid) {
          setFormData((prev) => ({ ...prev, final: finalForm.getValues() }));
        }
        break;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save all the onboarding data
      // In real app, make API calls to save user preferences
      setLocation("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Welcome to Mixxl!";
      case 2:
        return "Set Up Your Profile";
      case 3:
        return "Music Preferences";
      case 4:
        return userRole === "artist"
          ? "Artist Information"
          : "Privacy Settings";
      case 5:
        return userRole === "artist" ? "Privacy Settings" : "Almost Done!";
      case 6:
        return "Almost Done!";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Let's get you set up for an amazing music experience";
      case 2:
        return "Tell the community about yourself";
      case 3:
        return "Help us personalize your experience";
      case 4:
        return userRole === "artist"
          ? "Share your artistic journey"
          : "Choose your privacy preferences";
      case 5:
        return userRole === "artist"
          ? "Choose your privacy preferences"
          : "Review and confirm your choices";
      case 6:
        return "Review and confirm your choices";
      default:
        return "";
    }
  };

  const renderStepIndicators = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-8">
        <div className="flex items-center space-x-1 bg-black/20 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">Fan Setup</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 mixxl-gradient rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Mixxl!</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect with incredible artists, discover new music, and build
                your perfect playlists. Your musical journey starts here.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h4 className="text-lg font-semibold mb-2">
                      Join the Community
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with music lovers, follow your favorite artists,
                      and share your discoveries
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6 text-center">
                    <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <h4 className="text-lg font-semibold mb-2">
                      Discover Music
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Explore new sounds, hidden gems, and emerging artists from
                      around the world
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Music className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">
                    Let's set up your personalized music experience
                  </span>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Set Up Your Profile</h2>
              <p className="text-muted-foreground">
                Tell the community about yourself
              </p>
            </div>

            <Form {...profileForm}>
              <div className="space-y-4 max-w-xl mx-auto">
                <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How should others see you?"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share what kind of music you love..."
                          className="bg-white/5 border-white/10 resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, Country"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://your-site.com"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Music Preferences</h2>
              <p className="text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <Form {...preferencesForm}>
              <div className="space-y-6 max-w-2xl mx-auto">
                <FormField
                  control={preferencesForm.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Genres</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GENRES.map((genre) => {
                          const currentValues = Array.isArray(field.value)
                            ? field.value
                            : [];
                          const isSelected = currentValues.includes(genre);
                          return (
                            <Badge
                              key={genre}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer hover:scale-105 transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                              onClick={() => {
                                const current = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                const newValue = isSelected
                                  ? current.filter((g) => g !== genre)
                                  : [...current, genre];

                                // Force update both field and form state
                                field.onChange(newValue);
                                preferencesForm.setValue("genres", newValue, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });

                                console.log("Genre selection changed:", {
                                  genre,
                                  isSelected,
                                  current,
                                  newValue,
                                  willBeSelected: !isSelected,
                                  formValueAfter:
                                    preferencesForm.getValues().genres,
                                });
                              }}
                            >
                              {genre}
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="text-xs text-red-400 mt-1">
                        {formData.preferences?.genres &&
                          formData.preferences?.genres?.length > 0 && (
                            <span>
                              Selected: {formData.preferences.genres.length}{" "}
                              genres
                            </span>
                          )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="listenGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What are you hoping to achieve? (Optional)
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {LISTEN_GOALS.map((goal) => {
                          const currentValues = Array.isArray(field.value)
                            ? field.value
                            : [];
                          const isSelected = currentValues.includes(goal);
                          return (
                            <Badge
                              key={goal}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer hover:scale-105 transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                              onClick={() => {
                                const current = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                const newValue = isSelected
                                  ? current.filter((g) => g !== goal)
                                  : [...current, goal];

                                // Force update both field and form state
                                field.onChange(newValue);
                                preferencesForm.setValue(
                                  "listenGoals",
                                  newValue,
                                  { shouldValidate: true, shouldDirty: true }
                                );
                              }}
                            >
                              {goal}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 4:
        if (userRole === "artist") {
          // Artist-specific step
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h2 className="text-2xl font-bold">Artist Information</h2>
                <p className="text-muted-foreground">
                  Share your artistic journey
                </p>
              </div>
              {/* Artist form content */}
            </div>
          );
        } else {
          // Privacy settings for fans
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold">Privacy Settings</h2>
                <p className="text-muted-foreground">
                  Choose your privacy preferences
                </p>
              </div>

              <Form {...privacyForm}>
                <div className="space-y-6 max-w-xl mx-auto">
                  <FormField
                    control={privacyForm.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Choose visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">
                              Public - Anyone can see
                            </SelectItem>
                            <SelectItem value="friends">
                              Friends only
                            </SelectItem>
                            <SelectItem value="private">
                              Private - Only you
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={privacyForm.control}
                      name="allowMessages"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Allow direct messages</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Let other users send you messages
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={privacyForm.control}
                      name="allowTips"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Enable tipping artists</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Support your favorite artists with tips
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={privacyForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Email notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive updates and news via email
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </div>
          );
        }

      case 5:
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 mixxl-gradient rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Almost Done!</h2>
              <p className="text-lg text-muted-foreground">
                You're all set up and ready to dive into the world of
                independent music
              </p>
            </div>

            <Form {...finalForm}>
              <div className="space-y-4 max-w-xl mx-auto">
                <FormField
                  control={finalForm.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>
                          I agree to the{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                          >
                            Terms of Service
                          </Button>{" "}
                          and{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                          >
                            Privacy Policy
                          </Button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={finalForm.control}
                  name="subscribedToNewsletter"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>
                          Subscribe to our newsletter (Optional)
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Get updates on new features and artist spotlights
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {renderStepIndicators()}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">{getStepTitle()}</h1>
          <p className="text-muted-foreground text-lg">
            {getStepDescription()}
          </p>
          <div className="mt-4">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </div>

        <Card className="glass-effect border-white/10">
          <CardContent className="p-8">
            {renderStep()}

            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={
                  currentStep === 1
                    ? () => setLocation("/setup-role")
                    : prevStep
                }
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 1 ? "Back" : "Previous"}</span>
              </Button>

              <Button
                onClick={currentStep === totalSteps ? handleComplete : nextStep}
                className="flex items-center space-x-2 mixxl-gradient"
              >
                <span>
                  {currentStep === totalSteps ? "Complete Setup" : "Next"}
                </span>
                {currentStep !== totalSteps && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
