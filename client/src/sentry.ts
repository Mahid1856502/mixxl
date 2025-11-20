// client/src/sentry.ts
import * as Sentry from "@sentry/react";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) return;

  Sentry.init({
    dsn,
    // integrations: [
    //   Sentry.browserTracingIntegration(), // ✅ updated integration
    //   Sentry.replayIntegration?.(), // optional: Session Replay
    // ],
    environment: import.meta.env.VITE_ENV || "production",
    sendDefaultPii: true,

    integrations: [
      Sentry.replayIntegration(),
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

export function setSentryUserFromLocalStorage() {
  try {
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    if (id) {
      Sentry.setUser({
        id,
        email: email || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  } catch {}
}
