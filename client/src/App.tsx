import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { MusicPlayerProvider } from "@/hooks/use-music-player";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import GlobalAudioPlayer from "@/components/audio/global-audio-player";
import Navbar from "@/components/layout/navbar";
import { appRoutes } from "./routes/routes.config";
import { ProtectedRoute } from "./routes/protected";
import ScrollToTop from "./components/common/scroll-to-top";
import { Toaster as SonnerToaster } from "sonner";
import { useEffect } from "react";

function Router() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user?.role === "DJ" && location === "/dashboard") {
      setLocation("/radio");
    }
  }, [user, location, setLocation]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollToTop />
      <div className="mb-20">
        <Switch>
          {appRoutes.map(({ path, component, roles }) => (
            <Route
              key={path}
              path={path}
              component={() => (
                <ProtectedRoute component={component} roles={roles} />
              )}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioManagerProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <GlobalAudioPlayer />
              <SonnerToaster position="bottom-right" richColors />
            </TooltipProvider>
          </MusicPlayerProvider>
        </AuthProvider>
      </AudioManagerProvider>
    </QueryClientProvider>
  );
}

export default App;
