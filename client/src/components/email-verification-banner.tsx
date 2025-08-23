import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  user: {
    emailVerified?: boolean;
    email: string;
    firstName?: string;
  };
  onDismiss?: () => void;
}

export function EmailVerificationBanner({
  user,
  onDismiss,
}: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const resendMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/resend-verification"),
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

  // Don't show banner if user is verified or if dismissed
  if (user.emailVerified || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleResendEmail = () => {
    resendMutation.mutate();
  };

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="font-medium text-yellow-800 dark:text-yellow-200">
            Please verify your email address
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            We sent a verification link to <strong>{user.email}</strong>. Check
            your inbox and click the link to verify your account. (Expires in 24
            hours)
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={resendMutation.isPending}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-800"
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend
              </>
            )}
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-200 dark:hover:bg-yellow-800"
          >
            <X className="w-4 h-4" />
          </Button> */}
        </div>
      </AlertDescription>
    </Alert>
  );
}
