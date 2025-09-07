import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

// ---------- Types ----------
export type RequestPasswordResetInput = {
  email: string;
};

export type RequestPasswordResetResponse = {
  message: string;
};

// ---------- Query Function ----------
async function requestPasswordReset(
  data: RequestPasswordResetInput
): Promise<RequestPasswordResetResponse> {
  const res = await apiRequest("POST", "/api/auth/request-reset", data);
  if (!res.ok) throw new Error("Failed to send broadcast");
  return res.json();
}

// ---------- Hook ----------
export function useRequestPasswordReset() {
  return useMutation<
    RequestPasswordResetResponse,
    Error,
    RequestPasswordResetInput
  >({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast({
        title: "Email Sent",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}
