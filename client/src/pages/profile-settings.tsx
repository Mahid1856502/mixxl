import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/queryClient";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  User,
  Save,
  ArrowLeft,
  Camera,
  Settings,
  Headphones,
  AlertCircle,
} from "lucide-react";
import { useUpdateProfile } from "@/api/hooks/users/useUpdateProfile";
import { useCancelSubscription } from "@/api/hooks/stripe/useSubscriptionCancel";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import {
  useStripeAccount,
  useStripeAccountStatus,
} from "@/api/hooks/stripe/useStripeAccount";

export default function ProfileSettings() {
  const { user } = useAuth();
  console.log("user", user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState<"fan" | "artist">("fan");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading, error } = useStripeAccountStatus(
    user?.stripeAccountId
  );
  const { mutate: setupArtistAccount, isPending: settingStripeAccount } =
    useStripeAccount();
  const { mutate: cancelSubscription, isPending: isCancelling } =
    useCancelSubscription();

  console.log(" data, isLoading, error", data, isLoading, error);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
      setUserLocation(user.location || "");
      setWebsite(user.website || "");
      setRole(user.role as "fan" | "artist");
    }
  }, [user]);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Select a valid image file",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("firstName", firstName || "");
    formData.append("lastName", lastName || "");
    formData.append("bio", bio || "");
    formData.append("location", userLocation || "");
    formData.append("website", website || "");
    formData.append("role", role);
    if (selectedImage) formData.append("image", selectedImage);

    updateProfile(formData, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully!" });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setSelectedImage(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
      },
      onError: (err: any) => {
        toast({
          title: "Error updating profile",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleCancelSubscription = () => {
    cancelSubscription(undefined, {
      onSuccess: () => {
        setIsDialogOpen(false);
        // optionally invalidate user subscription query here
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
      <div className="max-w-4xl mx-auto space-y-8">
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
            onClick={handleSave}
            disabled={isPending}
            className="text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {user.role !== "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select
                      value={role}
                      onValueChange={(value: "fan" | "artist") =>
                        setRole(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fan">
                          Fan - Discover and enjoy music
                        </SelectItem>
                        <SelectItem value="artist">
                          Artist - Share and promote your music
                        </SelectItem>
                        <SelectItem value="DJ">
                          <div className="flex items-center space-x-2">
                            <Headphones className="w-4 h-4" />
                            <span>DJ - Curate and mix tracks</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

          {/* Profile Preview */}
          <div className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage
                        className="object-cover"
                        src={
                          imagePreview ??
                          (user.profileImage
                            ? `${BASE_URL}${user.profileImage}`
                            : "")
                        }
                        alt={user.username}
                      />
                      <AvatarFallback className="text-xl">
                        {firstName?.[0]?.toUpperCase() ||
                          user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {imagePreview && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {firstName && lastName
                      ? `${firstName} ${lastName}`
                      : user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                  {bio && (
                    <p className="text-sm text-muted-foreground italic">
                      "{bio}"
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Account Type:</span>
                    <span className="capitalize font-medium">{role}</span>
                  </div>
                  {userLocation && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{userLocation}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex justify-between">
                      <span>Website:</span>
                      <span className="text-primary">
                        {website.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {role === "artist" && (
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <span>Artist Payouts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.stripeAccountId &&
                    (data?.status === "none" ||
                      data?.status === "rejected") && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                          To receive direct payments for your songs, you need to
                          connect your Stripe Express account.
                        </p>
                        <Button
                          className="w-full text-white"
                          onClick={() => setupArtistAccount()}
                          disabled={settingStripeAccount}
                        >
                          Connect with Stripe
                        </Button>
                      </div>
                    )}

                  {data?.status === "pending" && (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Your Stripe account setup is pending. Please check your
                        email or contact support to complete the process.
                      </p>
                      <Button variant="outline" className="w-full" disabled>
                        Verification in progress
                      </Button>
                    </div>
                  )}

                  {data?.status === "complete" && (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Your Stripe account is connected. You’re ready to
                        receive payouts!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
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
