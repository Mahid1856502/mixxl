import { useAuth } from "@/provider/use-auth";
import { Redirect, useLocation } from "wouter";
import { PUBLIC_ROUTES } from "./routes.config";

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

  // If user exists but email is not verified → send back to login (except fans)
  // Fans can use the app without email verification

  const allowedPaths = PUBLIC_ROUTES.map((r) => r.path);
  if (
    user &&
    user.emailVerified === false &&
    user.role !== "fan" &&
    !allowedPaths.includes(location)
  ) {
    return <Redirect to="/login" />;
  }

  // If route requires a specific role but user doesn't match
  if (roles && user && !roles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  // Prevent logged-in users from hitting /login or /signup
  if (user && (location === "/login" || location === "/signup")) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}
