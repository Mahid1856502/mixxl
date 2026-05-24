import "dotenv/config";
import { listen, startCore } from "./bootstrap-core";
import { serveStatic } from "./static";

const { app, server } = await startCore();

if (process.env.NODE_ENV === "development") {
  const { setupVite } = await import("./vite-dev");
  await setupVite(app, server);
} else if (process.env.SERVE_STATIC !== "false") {
  serveStatic(app);
}

listen(server);
