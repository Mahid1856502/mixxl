import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/provider/tooltip";
import { useAuth, AuthProvider } from "@/provider/use-auth";
import { MusicPlayerProvider } from "@/provider/use-music-player";
import { AudioManagerProvider } from "@/provider/use-audio-manager";
import GlobalAudioPlayer from "@/provider/global-audio-player";
import Navbar from "@/components/layout/navbar";
import { appRoutes } from "./routes/routes.config";
import { ProtectedRoute } from "./routes/protected";
import ScrollToTop from "./components/common/scroll-to-top";
import { Toaster as SonnerToaster } from "sonner";
import { useEffect } from "react";
import CartButton from "./components/cart/cart-button";
import { CartProvider } from "./provider/cart-provider";

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
      <CartProvider>
        <AudioManagerProvider>
          <AuthProvider>
            <MusicPlayerProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <GlobalAudioPlayer />
                <CartButton />
                <SonnerToaster position="bottom-right" richColors />
              </TooltipProvider>
            </MusicPlayerProvider>
          </AuthProvider>
        </AudioManagerProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
