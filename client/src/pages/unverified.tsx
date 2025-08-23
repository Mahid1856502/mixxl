import { useAuth } from "@/hooks/use-auth";
import { EmailVerificationBanner } from "@/components/email-verification-banner";

export default function UnverifiedPage() {
  const { user, isLoading } = useAuth();

  console.log("user", user, isLoading);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner rounded-full w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {user && (
          <EmailVerificationBanner
            user={{
              emailVerified: user.emailVerified || false,
              email: user.email,
              firstName: user.firstName || undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}
