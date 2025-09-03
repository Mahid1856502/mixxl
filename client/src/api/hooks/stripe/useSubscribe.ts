import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface CreateSubscriptionResponse {
  url: string;
  trialEndsAt: string | null;
}

export function useCreateSubscription() {
  return useMutation({
    mutationFn: async (): Promise<CreateSubscriptionResponse> => {
      const res = await apiRequest("POST", "/api/create-subscription");
      if (!res.ok) throw new Error("Failed to create subscription");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription created!",
        description: data.trialEndsAt
          ? `Trial ends at ${new Date(data.trialEndsAt).toLocaleDateString()}`
          : undefined,
      });

      // Redirect to Stripe Checkout
      if (data.url) window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Error creating subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
