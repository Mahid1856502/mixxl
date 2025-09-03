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

function Router() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  if (user?.role === "DJ" && location === "/dashboard") {
    setLocation("/radio");
  }
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="loading-spinner rounded-full w-8 h-8"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollToTop />
      <div className="">
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
      <GlobalAudioPlayer />
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
