import { BASE_URL } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Link } from "wouter";
import { Button } from "../ui/button";
import { UseFormReturn, useWatch } from "react-hook-form";
import { User } from "@shared/schema";
import { userProfileInput } from "@/pages/profile-settings";
import { Camera, Settings } from "lucide-react";
import {
  useStripeAccount,
  useStripeAccountStatus,
} from "@/api/hooks/stripe/useStripeAccount";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function ProfilePreview({
  form,
  user,
  handleImageChange,
  isUploading,
  fileInputRef,
}: {
  form: UseFormReturn<userProfileInput>;
  user: User;
  handleImageChange: (file: File) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data } = useStripeAccountStatus();
  const { mutate: setupArtistAccount, isPending: settingStripeAccount } =
    useStripeAccount();

  const values = useWatch({
    control: form.control,
    name: [
      "firstName",
      "lastName",
      "bio",
      "role",
      "location",
      "website",
      "profileImage",
    ],
  });

  const [firstName, lastName, bio, role, location, website, profileImage] =
    values;

  console.log("profileImage", profileImage);
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    handleImageChange(file);
  };
  return (
    <>
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle>Profile Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage
                  src={previewImage ?? profileImage ?? ""}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl">
                  {firstName?.[0]?.toUpperCase() ||
                    user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {profileImage && (
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
                onChange={handleImage}
                className="hidden"
              />
              <Button
                variant="outline"
                disabled={isUploading}
                size="sm"
                type="button"
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
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {bio && (
              <p className="text-sm text-muted-foreground italic">"{bio}"</p>
            )}
          </div>

          <Separator />

          <div className="space-y-4 flex flex-col text-sm">
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="capitalize font-medium">
                {role || user?.role}
              </span>
            </div>
            {location && (
              <div className="flex justify-between">
                <span>Location:</span>
                <span>{location}</span>
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
            <Link
              href={`/reset-password?email=${encodeURIComponent(user?.email)}`}
            >
              <Button className="w-full">Change Password</Button>
            </Link>
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
              (data?.status === "none" || data?.status === "rejected") && (
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
                  Your Stripe account setup is pending. Please check your email
                  or contact support to complete the process.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Verification in progress
                </Button>
              </div>
            )}

            {data?.status === "complete" && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Your Stripe account is connected. You’re ready to receive
                  payouts!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
