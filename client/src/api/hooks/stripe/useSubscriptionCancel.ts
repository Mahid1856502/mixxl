import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface CancelSubscriptionResponse {
  message: string;
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CancelSubscriptionResponse> => {
      const res = await apiRequest("POST", "/api/subscription/cancel");
      if (!res.ok) throw new Error("Failed to cancel subscription");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription cancelled",
        description: data.message || "You will not be charged again.",
      });

      // Invalidate user session query so UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error cancelling subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
