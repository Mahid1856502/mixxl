import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const { data, error, isLoading } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      return response.json();
    },
    enabled: !!token,
    retry: false
  });

  const handleGoToDashboard = () => {
    // Invalidate user cache to get updated verification status
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    setLocation('/dashboard');
  };

  const handleGoToLogin = () => {
    setLocation('/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Verification Link</CardTitle>
            <CardDescription>
              The verification link is missing or invalid. Please check your email or request a new verification link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>
              {error.message || 'Something went wrong during verification'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Your verification link may have expired. You can request a new one after logging in.
              </AlertDescription>
            </Alert>
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Email Verified Successfully!</CardTitle>
            <CardDescription>
              Your email has been verified. You now have full access to all Mixxl features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}