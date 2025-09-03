import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
