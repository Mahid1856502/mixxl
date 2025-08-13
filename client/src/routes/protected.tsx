import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  roles?: string[];
}

export function ProtectedRoute({
  component: Component,
  roles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

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

  // If route requires a specific role but user doesn't match
  if (roles && user && !roles.includes(user.role)) {
    return <Redirect to="/unauthorized" />; // Or a 403 page
  }

  return <Component />;
}
