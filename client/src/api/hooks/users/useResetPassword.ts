import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

type ResetPasswordInput = {
  email: string;
  token?: string;
  oldPassword?: string;
  newPassword: string;
};

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", data);
      if (!res.ok) throw new Error("Failed to create broadcast");
      return res.json();
    },
    onSuccess: () =>
      toast({
        title: "Password Updated",
        description:
          "Your password has been updated successfully. You can now log in with your new password.",
      }),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });
}
