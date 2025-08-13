import { useState, useMemo, useEffect } from "react";
import {
  useStripe,
  Elements,
  PaymentElement,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Upload,
  TrendingUp,
  DollarSign,
  Music,
  Users,
  Zap,
} from "lucide-react";

// Stripe init outside render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Static features list
const features = [
  {
    icon: Upload,
    title: "Unlimited Music Uploads",
    description:
      "Upload as many tracks as you want with high-quality audio support",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description:
      "Track your performance with detailed insights and audience data",
  },
  {
    icon: DollarSign,
    title: "Monetization Tools",
    description: "Receive tips from fans and monetize your content",
  },
  {
    icon: Music,
    title: "Radio Submissions",
    description:
      "Submit your tracks for consideration on Mixxl Radio playlists",
  },
  {
    icon: Users,
    title: "Fan Engagement",
    description:
      "Connect with your audience through messaging and live sessions",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description: "Get faster response times and dedicated artist support",
  },
];

// Subscription payment form
const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Started!",
        description:
          "Your 90-day free trial has begun. Welcome to Mixxl Premium!",
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
      >
        {isLoading ? "Processing..." : "Start 90-Day Free Trial"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();

  // // Query to create subscription
  // const { data, isLoading, isError } = useQuery({
  //   queryKey: ["create-subscription"],
  //   queryFn: async () => {
  //     const res = await apiRequest("POST", "/api/create-subscription");
  //     if (!res.ok) throw new Error("Failed to initialize subscription");
  //     return res.json();
  //   },
  //   retry: false, // don't retry if Stripe key is bad
  // });

  // Show toast on error
  // useEffect(() => {
  //   if (isError) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to initialize subscription. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // }, [isError, toast]);

  // const clientSecret = data?.clientSecret ?? "";
  const clientSecret = "";
  const isLoading = true;
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

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

  if (user.stripeSubscriptionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Already Subscribed</h2>
            <p className="text-muted-foreground mb-6">
              You already have an active Mixxl subscription
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {features.map((feature, index) => (
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
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Start Your Free Trial</CardTitle>
                <p className="text-muted-foreground">
                  No payment required for 90 days. We'll remind you before your
                  trial ends.
                </p>
              </CardHeader>
              <CardContent>
                {isLoading || !clientSecret ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground mt-4">
                      Setting up your subscription...
                    </p>
                  </div>
                ) : (
                  <Elements stripe={stripePromise} options={options}>
                    <SubscribeForm />
                  </Elements>
                )}
              </CardContent>
            </Card>

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
