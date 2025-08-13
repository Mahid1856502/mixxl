import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Music, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Users, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Star,
  Radio,
  Upload,
  Heart,
  Globe
} from "lucide-react";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { DEFAULT_CURRENCY } from "@/lib/currency";

// Step 1: Basic Info Schema
const basicInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  preferredCurrency: z.string().default("GBP"),
});

// Step 2: Security Schema
const securitySchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 3: Role Selection Schema
const roleSchema = z.object({
  role: z.enum(["fan", "artist"], { required_error: "Please select a role" }),
});

// Step 4: Profile Setup Schema
const profileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  genres: z.array(z.string()).optional(),
  influences: z.string().optional(),
});

// Step 5: Preferences Schema
const preferencesSchema = z.object({
  allowMessaging: z.boolean().default(true),
  allowTips: z.boolean().default(true),
  allowCollaborations: z.boolean().default(false),
  includeInRadio: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
});

const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "R&B", "Country", "Electronic", "Jazz", "Blues",
  "Classical", "Reggae", "Folk", "Indie", "Alternative", "Metal", "Punk",
  "Funk", "Soul", "Gospel", "World", "Ambient", "House", "Techno", "Dubstep"
];

type BasicInfo = z.infer<typeof basicInfoSchema>;
type Security = z.infer<typeof securitySchema>;
type RoleInfo = z.infer<typeof roleSchema>;
type ProfileInfo = z.infer<typeof profileSchema>;
type Preferences = z.infer<typeof preferencesSchema>;

interface SignupWizardProps {
  onClose: () => void;
}

export default function SignupWizard({ onClose }: SignupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();

  // Form data storage
  const [formData, setFormData] = useState<{
    basicInfo?: BasicInfo;
    security?: Security;
    role?: RoleInfo;
    profile?: ProfileInfo;
    preferences?: Preferences;
  }>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Individual form instances
  const basicInfoForm = useForm<BasicInfo>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: formData.basicInfo || {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      preferredCurrency: DEFAULT_CURRENCY,
    },
  });

  const securityForm = useForm<Security>({
    resolver: zodResolver(securitySchema),
    defaultValues: formData.security || {
      password: "",
      confirmPassword: "",
    },
  });

  const roleForm = useForm<RoleInfo>({
    resolver: zodResolver(roleSchema),
    defaultValues: formData.role || {
      role: undefined,
    },
  });

  const profileForm = useForm<ProfileInfo>({
    resolver: zodResolver(profileSchema),
    defaultValues: formData.profile || {
      bio: "",
      location: "",
      website: "",
      genres: [],
      influences: "",
    },
  });

  const preferencesForm = useForm<Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: formData.preferences || {
      allowMessaging: true,
      allowTips: true,
      allowCollaborations: false,
      includeInRadio: false,
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  const nextStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await basicInfoForm.trigger();
        if (isValid) {
          setFormData(prev => ({ ...prev, basicInfo: basicInfoForm.getValues() }));
        }
        break;
      case 2:
        isValid = await securityForm.trigger();
        if (isValid) {
          setFormData(prev => ({ ...prev, security: securityForm.getValues() }));
        }
        break;
      case 3:
        isValid = await roleForm.trigger();
        if (isValid) {
          setFormData(prev => ({ ...prev, role: roleForm.getValues() }));
        }
        break;
      case 4:
        isValid = await profileForm.trigger();
        if (isValid) {
          setFormData(prev => ({ ...prev, profile: profileForm.getValues() }));
        }
        break;
      case 5:
        isValid = await preferencesForm.trigger();
        if (isValid) {
          setFormData(prev => ({ ...prev, preferences: preferencesForm.getValues() }));
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

  const handleSubmit = async () => {
    try {
      const allData = {
        ...formData.basicInfo!,
        ...formData.security!,
        ...formData.role!,
        ...formData.profile!,
        ...formData.preferences!,
      };

      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = allData;

      await signup(signupData);
      setLocation("/dashboard");
      onClose();
    } catch (error) {
      // Error is handled by the auth hook
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Basic Information</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>

            <Form {...basicInfoForm}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={basicInfoForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicInfoForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={basicInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            className="bg-white/5 border-white/10 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="johndoe"
                            {...field}
                            className="bg-white/5 border-white/10 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name="preferredCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Preferred Currency
                      </FormLabel>
                      <FormControl>
                        <CurrencySelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select your currency..."
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        This will be used for tips, payments, and earnings. You can change this later in settings.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Secure Your Account</h2>
              <p className="text-muted-foreground">Choose a strong password</p>
            </div>

            <Form {...securityForm}>
              <div className="space-y-4">
                <FormField
                  control={securityForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="bg-white/5 border-white/10 pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={securityForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="bg-white/5 border-white/10 pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Choose Your Role</h2>
              <p className="text-muted-foreground">How do you plan to use Mixxl?</p>
            </div>

            <Form {...roleForm}>
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer transition-all ${
                          field.value === "fan" 
                            ? "border-primary bg-primary/10" 
                            : "border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => field.onChange("fan")}
                      >
                        <CardContent className="p-6 text-center">
                          <Heart className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                          <h3 className="text-lg font-semibold mb-2">Music Fan</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Discover new music, support artists, and build your collection
                          </p>
                          <div className="space-y-2 text-xs text-left">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Stream unlimited music</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Create playlists</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Support artists with tips</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Join live radio sessions</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all ${
                          field.value === "artist" 
                            ? "border-primary bg-primary/10" 
                            : "border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => field.onChange("artist")}
                      >
                        <CardContent className="p-6 text-center">
                          <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                          <h3 className="text-lg font-semibold mb-2">Artist</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload music, connect with fans, and grow your audience
                          </p>
                          <div className="space-y-2 text-xs text-left">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Upload unlimited tracks</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Earn money from tips</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Host live radio shows</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>Collaborate with others</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Build Your Profile</h2>
              <p className="text-muted-foreground">Tell the community about yourself</p>
            </div>

            <Form {...profileForm}>
              <div className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={formData.role?.role === "artist" 
                            ? "Tell fans about your music journey..." 
                            : "Share what kind of music you love..."}
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
                            placeholder="https://your-website.com"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Genres (Optional)</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {MUSIC_GENRES.map((genre) => {
                          const isSelected = field.value?.includes(genre);
                          return (
                            <Badge
                              key={genre}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => {
                                const current = field.value || [];
                                if (isSelected) {
                                  field.onChange(current.filter(g => g !== genre));
                                } else {
                                  field.onChange([...current, genre]);
                                }
                              }}
                            >
                              {genre}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formData.role?.role === "artist" && (
                  <FormField
                    control={profileForm.control}
                    name="influences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Musical Influences (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. The Beatles, Radiohead, Miles Davis"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </Form>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h2 className="text-2xl font-bold">Final Preferences</h2>
              <p className="text-muted-foreground">Customize your Mixxl experience</p>
            </div>

            <Form {...preferencesForm}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy & Interactions</h3>
                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="allowMessaging"
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
                            <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
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
                            <FormLabel>Allow tips</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {formData.role?.role === "artist" 
                                ? "Let fans support you with tips" 
                                : "Enable tipping your favorite artists"}
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {formData.role?.role === "artist" && (
                      <>
                        <FormField
                          control={preferencesForm.control}
                          name="allowCollaborations"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Open to collaborations</FormLabel>
                                <p className="text-sm text-muted-foreground">Let other artists invite you to collaborate</p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="includeInRadio"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Include music in radio rotation</FormLabel>
                                <p className="text-sm text-muted-foreground">Allow your tracks to be played on community radio</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
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
                            <p className="text-sm text-muted-foreground">Receive updates and news via email</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Push notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">Get instant notifications in your browser</p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg mixxl-gradient flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold mixxl-gradient-text">Mixxl</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join the community</h1>
          <p className="text-muted-foreground">Create your account in just a few steps</p>
        </div>

        <Card className="glass-effect border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
                <CardDescription>Complete your profile setup</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? onClose : prevStep}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 1 ? "Cancel" : "Previous"}</span>
              </Button>

              <Button
                onClick={currentStep === totalSteps ? handleSubmit : nextStep}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? "Create Account" : "Next"}</span>
                {currentStep !== totalSteps && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}