import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  roles?: string[];
}

export function ProtectedRoute({
  component: Component,
  roles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner rounded-full w-8 h-8"></div>
      </div>
    );
  }

  // If route requires login but no user
  if (roles && !user) {
    return <Redirect to="/login" />;
  }

  // If user exists but email is not verified
  // Skip redirect if already on login or signup page
  if (
    user &&
    user?.emailVerified === false &&
    !["/login", "/signup"].includes(location)
  ) {
    return <Redirect to="/unverified" />;
  }

  // If route requires a specific role but user doesn't match
  if (roles && user && !roles.includes(user.role)) {
    return <Redirect to="/unauthorized" />; // Or a 403 page
  }

  return <Component />;
}
