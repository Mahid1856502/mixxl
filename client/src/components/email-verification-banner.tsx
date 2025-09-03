import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useResendVerification } from "@/api/hooks/users/useResendVerfication";

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
}: EmailVerificationBannerProps) {
  const resendMutation = useResendVerification();
  // Don't show banner if user is verified or if dismissed
  if (user.emailVerified) {
    return null;
  }

  const handleResendEmail = () => {
    resendMutation.mutate({ email: user.email });
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
        </div>
      </AlertDescription>
    </Alert>
  );
}
