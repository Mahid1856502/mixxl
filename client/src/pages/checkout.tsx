import { useEffect, useState } from "react";
import {
  useStripe,
  Elements,
  PaymentElement,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Euro,
  Music,
  Heart,
  ArrowLeft,
  Lock,
} from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({
  amount,
  description,
  type = "tip",
}: {
  amount: number;
  description: string;
  type?: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description:
          type === "tip"
            ? "Your tip has been sent!"
            : "Thank you for your purchase!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mixxl-gradient text-white font-semibold h-12"
      >
        {isProcessing ? (
          <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
        ) : (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {isProcessing ? "Processing..." : `Pay £${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Get payment details from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get("amount");
    const type = urlParams.get("type");
    const description = urlParams.get("description");
    const artistId = urlParams.get("artistId");
    const trackId = urlParams.get("trackId");

    if (amount && type && description) {
      setPaymentDetails({
        amount: parseFloat(amount),
        type,
        description,
        artistId,
        trackId,
      });

      // Create PaymentIntent based on type
      createPaymentIntent({
        amount: parseFloat(amount),
        type,
        description,
        artistId,
        trackId,
      });
    } else {
      // Fallback to localStorage or default values
      const savedDetails = localStorage.getItem("checkout_details");
      if (savedDetails) {
        const details = JSON.parse(savedDetails);
        setPaymentDetails(details);
        createPaymentIntent(details);
      } else {
        // Default test payment
        const defaultDetails = {
          amount: 10.0,
          type: "tip",
          description: "Artist tip",
          artistId: null,
          trackId: null,
        };
        setPaymentDetails(defaultDetails);
        createPaymentIntent(defaultDetails);
      }
    }
  }, []);

  const createPaymentIntent = async (details: any) => {
    try {
      setLoading(true);

      if (details.type === "tip") {
        // Create tip payment
        const response = await apiRequest("POST", "/api/tips", {
          toUserId: details.artistId,
          trackId: details.trackId,
          amount: details.amount,
          message: details.description,
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } else {
        // Create general payment intent
        const response = await apiRequest(
          "POST",
          "/api/create-payment-intent",
          {
            amount: details.amount,
            description: details.description,
          }
        );
        const data = await response.json();
        setClientSecret(data.clientSecret);
      }
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to complete your payment
            </p>
            <Button className="mixxl-gradient text-white">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="loading-spinner rounded-full w-8 h-8 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Setting up payment...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we prepare your secure checkout
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPaymentIcon = () => {
    switch (paymentDetails?.type) {
      case "tip":
        return <Heart className="w-6 h-6 text-red-500" />;
      case "track":
        return <Music className="w-6 h-6 text-purple-500" />;
      default:
        return <Euro className="w-6 h-6 text-green-500" />;
    }
  };

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="inline-flex items-center space-x-2 mb-4">
            {getPaymentIcon()}
            <h1 className="text-3xl font-bold mixxl-gradient-text">
              Secure Checkout
            </h1>
          </div>
          <p className="text-muted-foreground">
            Complete your payment securely with Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    amount={paymentDetails.amount}
                    description={paymentDetails.description}
                    type={paymentDetails.type}
                  />
                </Elements>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="glass-effect border-white/10 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment information is encrypted and secure. Powered
                      by Stripe.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getPaymentIcon()}
                    <div>
                      <p className="font-medium capitalize">
                        {paymentDetails.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {paymentDetails.description}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Amount</span>
                      <span>£{paymentDetails.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee</span>
                      <span>£0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>£{paymentDetails.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-3">
                    We accept:
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Visa
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Mastercard
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      PayPal
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Apple Pay
                    </Badge>
                  </div>
                </div>

                {/* Benefits */}
                {paymentDetails.type === "tip" && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm font-medium mb-2">
                      What happens next:
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Artist receives your tip instantly</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Support independent music</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Email confirmation sent</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="glass-effect border-white/10 mt-6">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Need help with your payment?
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
