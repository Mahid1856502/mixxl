import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { FREE_TRAIL } from "@/lib/constants";
import { useCreateSubscription } from "@/api/hooks/stripe/useSubscribe";

// Stripe init outside render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}

export default function Subscribe() {
  const { user } = useAuth();
  const { mutate: subscribe, isPending } = useCreateSubscription();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to subscribe
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if (user.stripeSubscriptionId) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Card className="w-full max-w-md">
  //         <CardContent className="pt-6 text-center">
  //           <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
  //           <h2 className="text-2xl font-bold mb-4">Already Subscribed</h2>
  //           <p className="text-muted-foreground mb-6">
  //             You already have an active Mixxl subscription
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            90-Day Free Trial
          </Badge>
          <h1 className="text-4xl font-bold mixxl-gradient-text">
            Start Your Mixxl Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of independent artists building their careers on
            Mixxl
          </p>
          <Button
            onClick={() => (window.location.href = "/pricing-comparison")}
            variant="outline"
            className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
          >
            Compare Plans
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features */}
          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  <span>What's Included</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {FREE_TRAIL.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <feature.icon className="w-4 h-4 text-amber-500" />
                        <h4 className="font-medium">{feature.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="glass-effect border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2 mixxl-gradient-text">
                  Simple, Transparent Pricing
                </h3>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    £10
                    <span className="text-lg text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Just 33p per day
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
                    90 Days Free Trial
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Cancel anytime, no contracts
                  </p>
                </div>
              </CardContent>
            </Card>
            {user.subscriptionStatus === "trialing" ? (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Trial Active
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    You’re enjoying your 90-day free trial. Explore all premium
                    features! We’ll notify you before it ends.
                  </p>
                </CardHeader>
                <CardContent className="mt-4 flex flex-col items-center space-y-4">
                  <Button disabled className="w-full max-w-xs">
                    Trial Active
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Trial ends on{" "}
                    {user?.trialEndsAt
                      ? new Date(user.trialEndsAt).toLocaleDateString()
                      : ""}
                  </p>
                </CardContent>
              </Card>
            ) : user.subscriptionStatus === "canceled" ||
              !user.stripeSubscriptionId ? (
              <Card className="glass-effect p-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Start Your Free Trial
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    No payment required for 90 days. Unlock premium features and
                    get reminded before your trial ends.
                  </p>
                </CardHeader>
                <CardContent className="mt-4 flex flex-col items-center space-y-4">
                  <Button
                    onClick={() => subscribe()}
                    disabled={isPending}
                    className="w-full max-w-xs"
                  >
                    {isPending ? "Processing..." : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-effect p-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Subscribed ✅
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    You’re currently subscribed. Enjoy all premium features!
                  </p>
                </CardHeader>
                <CardContent className="mt-4 flex flex-col items-center space-y-4">
                  <Button disabled className="w-full max-w-xs">
                    Subscribed
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>
                By subscribing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
              <p className="mt-2">Questions? Contact support@mixxl.fm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
