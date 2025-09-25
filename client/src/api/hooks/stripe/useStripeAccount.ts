// src/hooks/useStripeAccount.ts
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export type StripeAccountStatus = "none" | "pending" | "complete" | "rejected";

interface StripeAccountStatusResponse {
  accountId: string;
  status: StripeAccountStatus;
  rejectReason: string | null;
  raw: {
    details_submitted: boolean;
    requirements: Record<string, any>;
  };
}

// Reusable function for create/refresh
async function requestStripeAccount(refresh = false) {
  const url = refresh
    ? "/api/artist/stripe-account/refresh"
    : "/api/artist/stripe-account";

  const res = await apiRequest("POST", url);

  if (!res.ok) {
    throw new Error(
      `Failed to ${refresh ? "refresh" : "create"} Stripe account`
    );
  }

  return res.json(); // { onboardingUrl, stripeAccountId, ... }
}

export function useStripeAccount(refresh = false) {
  return useMutation({
    mutationFn: () => requestStripeAccount(refresh),
    onSuccess: (data) => {
      if (data.onboardingUrl) {
        toast({ title: "Redirecting to Stripe onboarding…" });
        window.location.href = data.onboardingUrl;
      } else {
        toast({
          title: refresh
            ? "Stripe account refreshed"
            : "Stripe account created",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: error.message || "Stripe account request failed",
      });
    },
  });
}

// Account status
async function fetchStripeAccountStatus(): Promise<StripeAccountStatusResponse> {
  const res = await apiRequest("GET", `/api/artist/account-status`);

  if (!res.ok) {
    throw new Error("Failed to fetch Stripe account status");
  }

  return res.json();
}

export function useStripeAccountStatus() {
  return useQuery({
    queryKey: ["stripeAccountStatus"],
    queryFn: () => fetchStripeAccountStatus(),
    retryOnMount: true,
    refetchInterval: 10_000,
  });
}
