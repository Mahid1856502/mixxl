import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStripeAccountStatus,
  useStripeAccount,
} from "@/api/hooks/stripe/useStripeAccount";
import { useAuth } from "@/hooks/use-auth";

export default function OnboardingStatus() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useStripeAccountStatus();
  const { mutate: refreshAccount, isPending } = useStripeAccount(true);

  const renderState = () => {
    if (isLoading)
      return {
        icon: <Clock className="h-6 w-6 text-gray-400 animate-spin" />,
        msg: "Checking onboarding status...",
        action: null,
      };

    if (error || !data)
      return {
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        msg: "Something went wrong, please try again.",
        action: (
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        ),
      };

    if (data.status === "complete")
      return {
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        msg: "Onboarding Complete 🎉. You can payout you revenue now!",
        action: null,
      };

    if (data.status === "rejected")
      return {
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        msg: `Rejected: ${data.rejectReason || "Unknown reason"}`,
        action: (
          <Button disabled={isPending} onClick={() => refreshAccount()}>
            Retry Onboarding
          </Button>
        ),
      };

    if (data.status === "none")
      return {
        icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
        msg: "No Stripe account connected yet.",
        action: (
          <Button disabled={isPending} onClick={() => refreshAccount()}>
            {user?.stripeAccountId ? "Resume Payout Setup" : "Enable Payouts"}
          </Button>
        ),
      };

    return {
      icon: <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />,
      msg: "Onboarding in progress. We'll notify you shortly!",
      action: null,
    };
  };

  const { icon, msg, action } = renderState();

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 glass-effect border-white/10">
        <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
          {icon}
          <p className="text-base text-gray-300">{msg}</p>
          {action}
        </CardContent>
      </Card>
    </div>
  );
}
