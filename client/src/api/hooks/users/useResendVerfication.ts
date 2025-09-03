import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest(
        "POST",
        "/api/auth/resend-verification",
        data
      );
      if (!res.ok) throw new Error("Failed to resend verification email");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification link.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
}
