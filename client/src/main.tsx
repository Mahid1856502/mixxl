import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./provider/use-auth";
import { queryClient } from "@/lib/queryClient";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";
import { initSentry, setSentryUserFromLocalStorage } from "./sentry";
import { ErrorBoundary } from "@sentry/react";

initSentry();
setSentryUserFromLocalStorage(); // run on app start

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </QueryClientProvider>
);
