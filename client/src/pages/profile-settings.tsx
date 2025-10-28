import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { User, Save, ArrowLeft, Settings, AlertCircle } from "lucide-react";
import { useUpdateProfile } from "@/api/hooks/users/useUpdateProfile";
import { useCancelSubscription } from "@/api/hooks/stripe/useSubscriptionCancel";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import ProfilePreview from "@/components/profile/profile-preview";
import { useStripeCountries } from "@/api/hooks/stripe/useStripeCountries";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().max(200).optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  role: z.enum(["fan", "artist"]).nullable().catch(null), // 👈 if not fan/artist → null
  profileImage: z.string().url().nullable().or(z.literal("")), // 👈 empty string is fine
  country: z.string().min(1, "Please select your country"),
});

export type userProfileInput = z.infer<typeof schema>;

export default function ProfileSettings() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, isUploading } = useUploadFile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: countries = [], isLoading: isCountriesLoading } =
    useStripeCountries();

  const form = useForm<userProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      bio: "",
      location: "",
      website: "",
      role: null,
      profileImage: "",
      country: "",
    },
  });

  const { mutate: cancelSubscription, isPending: isCancelling } =
    useCancelSubscription();

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        country: user?.country,
        role: ["fan", "artist"].includes(user.role)
          ? (user.role as "fan" | "artist")
          : null, // 👈 force null if invalid
        profileImage: user.profileImage || "",
      });
    }
  }, [user, countries, form]);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleImageChange = async (file: File) => {
    try {
      const publicUrl = await uploadFile(file); // uploadFile returns a URL
      form.setValue("profileImage", publicUrl);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: userProfileInput) => {
    updateProfile({
      fullName: values.fullName,
      bio: values.bio,
      location: values.location,
      website: values.website,
      role: values.role ?? null, // 👈 safe null
      profileImage: values?.profileImage || null,
      country: values?.country,
    });
  };

  const handleCancelSubscription = () => {
    cancelSubscription(undefined, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access profile settings
            </p>
            <Link href="/login">
              <Button className="mixxl-gradient text-white">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Settings className="w-8 h-8 text-primary" />
                <span>Profile Settings</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your profile information and preferences
              </p>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isPending || isUploading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    {...form.register("fullName")}
                    placeholder="Enter your first name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...form.register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                  {form.formState.errors.bio && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.bio.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" {...form.register("location")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      {...form.register("website")}
                      placeholder="https://yourwebsite.com"
                    />
                    {form.formState.errors.website && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Controller
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isCountriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isCountriesLoading
                                  ? "Loading countries..."
                                  : "Select your country"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.country && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.country.message}
                      </p>
                    )}
                  </div>

                  {user.role !== "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="role">Account Type</Label>
                      <Controller
                        control={form.control}
                        name="role"
                        render={({ field }) => {
                          const isRoleInvalid = field.value === null;

                          return (
                            <Select
                              value={field.value ?? undefined}
                              onValueChange={field.onChange}
                              disabled={isRoleInvalid} // 👈 disables the dropdown
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isRoleInvalid
                                      ? user?.role
                                      : "Select your account type"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fan">Fan</SelectItem>
                                <SelectItem value="artist">Artist</SelectItem>
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {user?.stripeSubscriptionId &&
              user?.subscriptionStatus !== "canceled" && (
                <Card className="glass-effect border-white/10 mt-6 w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span>Cancel Subscription</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Cancelling your subscription will stop future payments.
                      You will retain access to premium features until the end
                      of your current billing period.
                    </p>
                    <Button
                      className="border border-red-500 bg-red-950"
                      onClick={() => setIsDialogOpen(true)}
                      disabled={isCancelling} // from your hook
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  </CardContent>
                </Card>
              )}
          </div>

          <ProfilePreview
            user={user}
            form={form}
            handleImageChange={handleImageChange}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
          />
        </div>
      </form>
      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You will lose access to premium features."
        confirmText="Yes, Cancel"
        cancelText="No, Keep it"
        onConfirm={handleCancelSubscription}
        isPending={isCancelling}
      />
    </div>
  );
}
