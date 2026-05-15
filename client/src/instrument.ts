import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "https://129437c6bfa90452cc04a1776a735adc@o4510395899969536.ingest.us.sentry.io/4510395929526272",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});