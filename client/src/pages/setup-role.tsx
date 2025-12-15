import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/provider/use-auth";
import { Music, User, Star, Heart, CheckCircle } from "lucide-react";

export default function SetupRole() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"fan" | "artist" | null>(
    null
  );

  const handleQuickSetup = (role: "fan" | "artist") => {
    // Quick setup - just set the role and go to dashboard
    // In a real app, you'd make an API call to update the user's role
    setLocation("/dashboard");
  };

  const handleFullSetup = () => {
    // Redirect to the full onboarding wizard
    setLocation("/onboarding?restart=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 rounded-xl mixxl-gradient flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold mixxl-gradient-text">
              Mixxl
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Complete Your Setup</h1>
          <p className="text-xl text-muted-foreground">
            Choose your account type to get started
          </p>
        </div>

        <Card className="glass-effect border-white/10 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Account Type</h2>
              <p className="text-muted-foreground">
                Select how you want to use Mixxl
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Fan Option */}
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "fan"
                    ? "border-pink-400 bg-pink-400/10"
                    : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => setSelectedRole("fan")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-pink-400/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Fan</h3>
                      <p className="text-sm text-muted-foreground">
                        Discover and support music
                      </p>
                    </div>
                    {selectedRole === "fan" && (
                      <CheckCircle className="w-6 h-6 text-pink-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Artist Option */}
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "artist"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => setSelectedRole("artist")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full mixxl-gradient flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Artist</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your music and build your audience
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-1 rounded-full">
                          90-day free trial • Zero commission
                        </span>
                      </div>
                    </div>
                    {selectedRole === "artist" && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => selectedRole && handleQuickSetup(selectedRole)}
                disabled={!selectedRole}
                className="w-full h-12 text-lg font-semibold mixxl-gradient hover:opacity-90"
              >
                Continue as{" "}
                {selectedRole === "fan"
                  ? "Fan"
                  : selectedRole === "artist"
                  ? "Artist"
                  : "..."}
              </Button>

              <Button
                variant="ghost"
                onClick={handleFullSetup}
                className="w-full text-primary hover:text-primary hover:bg-primary/10"
              >
                Complete full setup instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
