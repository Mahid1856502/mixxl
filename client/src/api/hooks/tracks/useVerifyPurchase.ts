import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// --- Hook to verify Stripe Checkout session ---
export function useVerifyPurchase(sessionId?: string) {
  return useQuery({
    queryKey: ["verifyPurchase", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("Session ID is required");
      const res = await apiRequest(
        "GET",
        `/api/purchase/verify?session_id=${sessionId}`
      );
      if (!res.ok) throw new Error("Failed to verify checkout session");
      return res.json();
    },

    enabled: !!sessionId, // only run if sessionId exists
    retry: 1,
    staleTime: 0,
  });
}
