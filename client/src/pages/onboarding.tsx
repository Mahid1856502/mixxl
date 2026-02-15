import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Music,
  Heart,
  Users,
  Globe,
  Star,
  Radio,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import TrackUploadStep from "@/components/onboarding/track-upload-step";

// Welcome Step Schema
const welcomeSchema = z.object({
  acknowledged: z.boolean().default(true),
});

// Account Step Schema
const accountSchema = z.object({
  artistName: z.string().min(2, "Artist name must be at least 2 characters"),
  realName: z.string().min(2, "Real name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Preferences Step Schema (fileUrl from S3 after upload)
const tracksSchema = z.object({
  tracks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        fileUrl: z.string().url(),
      }),
    )
    .min(1, "Upload at least 1 track")
    .max(5, "Maximum 5 tracks allowed"),
});

// Artist Socials Step Schema (optional, for demo submission)
const artistSocialsSchema = z.object({
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  soundcloud: z.string().optional(),
});

// Message Step Schema (optional, for demo submission)
const messageSchema = z.object({
  message: z.string().default(""),
});

type WelcomeData = z.infer<typeof welcomeSchema>;
type AccountData = z.infer<typeof accountSchema>;
type TracksData = z.infer<typeof tracksSchema>;
type ArtistSocialsData = z.infer<typeof artistSocialsSchema>;
type MessageData = z.infer<typeof messageSchema>;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  // Form data storage
  const [formData, setFormData] = useState<{
    welcome?: WelcomeData;
    account?: AccountData;
    tracks?: TracksData;
    artistSocials?: ArtistSocialsData;
    message?: MessageData;
  }>({});

  // Check if restarting from setup-role page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("restart") === "true") {
      setCurrentStep(1);
    }
  }, []);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const accountForm = useForm<AccountData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      artistName: "",
      realName: "",
      email: "",
      password: "",
    },
  });

  const tracksForm = useForm<TracksData>({
    resolver: zodResolver(tracksSchema),
    defaultValues: { tracks: [] },
  });

  const artistSocialsForm = useForm<ArtistSocialsData>({
    resolver: zodResolver(artistSocialsSchema),
    defaultValues: {
      twitter: "",
      facebook: "",
      instagram: "",
      soundcloud: "",
    },
  });

  const messageForm = useForm<MessageData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 0:
        // Welcome step doesn't need validation, just proceed
        isValid = true;
        setFormData((prev) => ({ ...prev, welcome: { acknowledged: true } }));
        break;
      case 1:
        isValid = await accountForm.trigger();
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            account: accountForm.getValues(),
          }));
        }
        break;

      case 2:
        isValid = await tracksForm.trigger();
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            tracks: tracksForm.getValues(),
          }));
        }
        break;

      case 3:
        // Artist Socials - all optional, always valid
        isValid = true;
        setFormData((prev) => ({
          ...prev,
          artistSocials: artistSocialsForm.getValues(),
        }));
        break;
      case 4:
        // Message - optional, always valid
        isValid = true;
        setFormData((prev) => ({
          ...prev,
          message: messageForm.getValues(),
        }));
        break;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const account = formData.account;
    const tracks = formData.tracks;
    const artistSocials = formData.artistSocials;
    const messageData = messageForm.getValues();

    if (!account || !tracks) {
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/demo-submission", {
        account,
        tracks: tracks.tracks.map((t) => ({
          id: t.id,
          title: t.title,
          fileUrl: t.fileUrl,
        })),
        artistSocials,
        message: messageData.message,
        final: { agreedToTerms: true, subscribedToNewsletter: false },
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user?.id);
        localStorage.setItem("email", data.user?.email);
      }
      setCurrentStep(totalSteps);
    } catch (error: unknown) {
      console.error("Error completing onboarding:", error);
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to submit demo. Please try again.";
      toast.error(msg);
      throw error;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Welcome to Mixxl!";
      case 1:
        return "Set Up Your Profile";
      case 2:
        return "Upload Your Music";
      case 3:
        return "Artist Socials";
      case 4:
        return "Message";
      case 5:
        return "Check your email";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 0:
        return "Let's get you set up for an amazing music experience";
      case 1:
        return "Tell the community about yourself";
      case 2:
        return "Help us evaluate your music";
      case 3:
        return "Please enter your social ids for the following networks";
      case 4:
        return "Use this section to tell Mixxl Media Records about yourself and your music";
      case 5:
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
          <span className="text-sm font-medium text-amber-400">
            Artist Onboarding for Record label
          </span>
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
      case 0:
        return (
          <div className="space-y-10">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 mixxl-gradient rounded-full flex items-center justify-center">
                <Radio className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold mb-4">
                Demo Submission — Mixxl Media Records
              </h2>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                This form is for artists who want to submit music directly to
                <span className="text-primary font-semibold">
                  {" "}
                  Mixxl Media Records{" "}
                </span>
                for label review.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Demo Submission Card */}
              <Card className="glass-effect border-white/10">
                <CardContent className="p-6 space-y-4 text-center">
                  <Sparkles className="w-10 h-10 mx-auto text-amber-400" />
                  <h4 className="text-lg font-semibold">
                    Submit a Demo to the Label
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Send us up to{" "}
                    <span className="text-white font-medium">5 tracks</span>.
                    Our A&R team listens to{" "}
                    <span className="text-white">all genres</span>, styles and
                    sounds. If it’s your music, we want to hear it.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If selected, we’ll contact you via email.
                  </p>
                </CardContent>
              </Card>

              {/* Platform Signup Card */}
              <Card className="glass-effect border-white/10">
                <CardContent className="p-6 space-y-4 text-center">
                  <Music className="w-10 h-10 mx-auto text-primary" />
                  <h4 className="text-lg font-semibold">
                    Just Want to Upload & Sell Music?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    If you're looking to create a profile, upload tracks, build
                    a fanbase, and sell your music on the platform — you need a
                    regular artist account instead.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-2 border-primary text-primary hover:text-primary hover:bg-primary/40"
                    onClick={() => setLocation("/signup")}
                  >
                    Go to Artist Signup
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <Heart className="w-6 h-6 text-pink-400" />
                <span className="text-sm font-medium">
                  We’re musicians first. No genre bias. If it moves us, it
                  matters.
                </span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Artist Account Details</h2>
              <p className="text-muted-foreground">
                We need this to contact you and manage your submission
              </p>
            </div>

            <Form {...accountForm}>
              <div className="space-y-4 max-w-xl mx-auto">
                <FormField
                  control={accountForm.control}
                  name="artistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your stage / project name"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="realName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Real Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your real name"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 2:
        return <TrackUploadStep form={tracksForm} />;

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Artist Socials</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Please enter your social ids for the following networks. Your
                information will only be passed to Mixxl Media Records and
                cannot be used by them to login, post or make changes to your
                account.
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                This is optional and is not required to submit your demo.
              </p>
            </div>

            <Form {...artistSocialsForm}>
              <div className="space-y-4 max-w-xl mx-auto">
                <FormField
                  control={artistSocialsForm.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter / X</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="@username or profile URL"
                          {...field}
                          value={field.value ?? ""}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={artistSocialsForm.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username or profile URL"
                          {...field}
                          value={field.value ?? ""}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={artistSocialsForm.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="@username or profile URL"
                          {...field}
                          value={field.value ?? ""}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={artistSocialsForm.control}
                  name="soundcloud"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SoundCloud</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username or profile URL"
                          {...field}
                          value={field.value ?? ""}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Message</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Use this section to tell Mixxl Media Records about yourself and
                your music.
              </p>
            </div>

            <div className="space-y-4 max-w-xl mx-auto">
              <label
                htmlFor="message"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Your message
              </label>
              <Textarea
                id="message"
                placeholder="Tell us about your background, influences, what you're working on, or anything else you'd like us to know..."
                {...messageForm.register("message")}
                className="bg-white/5 border-white/10 min-h-[200px]"
                rows={8}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 mixxl-gradient rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Check your email</h2>
              <p className="text-lg text-muted-foreground">
                We sent a verification link to your email. If you don't see it,
                check your spam folder or try signing up again.
              </p>
            </div>
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

            {currentStep !== totalSteps && (
              <div
                className={`flex ${currentStep !== 0 ? "justify-between" : "justify-end"} pt-8`}
              >
                {currentStep !== 0 && (
                  <Button
                    variant="outline"
                    onClick={
                      currentStep === 0
                        ? () => setLocation("/setup-role")
                        : prevStep
                    }
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{currentStep === 0 ? "Back" : "Previous"}</span>
                  </Button>
                )}
                <Button
                  onClick={
                    currentStep === totalSteps - 1 ? handleComplete : nextStep
                  }
                  className="flex items-center space-x-2 mixxl-gradient"
                >
                  <span>
                    {currentStep === totalSteps - 1 ? "Complete Setup" : "Next"}
                  </span>
                  {currentStep !== totalSteps - 1 && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
