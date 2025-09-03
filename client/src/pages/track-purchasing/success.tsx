import { useVerifyCheckoutSession } from "@/api/hooks/stripe/useSessionVerification";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { useEffect } from "react";
import { useVerifyPurchase } from "@/api/hooks/tracks/useVerifyPurchase";

export default function PurchasingSuccess() {
  const params = useSearch();
  const sessionId = params.split("=")[1];

  const queryClient = useQueryClient();

  // Only call the API if needed (user not yet verified)
  const { data, isLoading, isError } = useVerifyPurchase(
    sessionId || undefined
  );

  // Invalidate user query after successful verification
  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  }, [data, queryClient]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <p>Verifying your checkout...</p>
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <p>Something went wrong. Please contact support.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-2xl font-bold">Checkout Successful! 🎉</h1>
      <p className="my-4">
        You can listen and add this track in your playlist.
      </p>
      <Link href="/dashboard" replace>
        <Button>Enjoy!</Button>
      </Link>
    </div>
  );
}
