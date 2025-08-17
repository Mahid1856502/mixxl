import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "dotenv/config";
import cors from "cors";

const app = express();

// ---- ENV ----
const NODE_ENV = process.env.NODE_ENV || "development"; // "development" | "production"
const PORT = parseInt(process.env.PORT || "5000", 10);

// ---- CONFIG BASED ON NODE_ENV ----
const CORS_ORIGIN =
  NODE_ENV === "development" ? "http://localhost:5173" : "https://mixxl.fm";

// ---- MIDDLEWARE ----
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.options("*", cors({ origin: CORS_ORIGIN, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---- LOGGING ----
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ---- SERVER BOOTSTRAP ----
(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });

    if (NODE_ENV === "development") {
      console.error(err);
    }
  });

  // Vite in dev, static build in prod
  if (NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen({ port: PORT, host: "0.0.0.0" }, () =>
    log(`🚀 [${NODE_ENV}] Server running at http://0.0.0.0:${PORT}`)
  );
})();
