import {
  useStripeAccount,
  useStripeAccountStatus,
} from "@/api/hooks/stripe/useStripeAccount";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import React from "react";

const RetryOnboarding = () => {
  const { data, isLoading, error, refetch } = useStripeAccountStatus();
  const { mutate: setupArtistAccount } = useStripeAccount(true); // pass true for refresh stripe account

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 flex flex-col items-center justify-center">
          <div className="flex mb-4 gap-2 items-center ">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-base text-gray-300">
              Something went wrong, please try again later
            </p>
          </div>

          <Button onClick={() => setupArtistAccount()}>
            Retry Account Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetryOnboarding;
