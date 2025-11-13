// ✅ Add this block FIRST — before any imports
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("🚨 Unhandled Rejection:", reason);
// });

// process.on("uncaughtException", (err) => {
//   console.error("🔥 Uncaught Exception:", err);
// });

// process.on("SIGINT", () => {
//   console.log("👋 Gracefully shutting down (SIGINT)");
//   process.exit(0);
// });

// process.on("SIGTERM", () => {
//   console.log("👋 Gracefully shutting down (SIGTERM)");
//   process.exit(0);
// });

process.on("SIGINT", (signal) => console.log("🚨 SIGINT received:", signal));
process.on("SIGTERM", (signal) => console.log("🚨 SIGTERM received:", signal));
process.on("exit", (code) => console.log("🛑 Process exit with code", code));

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { createWSS } from "./ws"; // 👈 our new module
import { registerWebhooksRoutes } from "./webhooks";

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = parseInt(process.env.PORT || "5000", 10);

const CORS_ORIGIN =
  NODE_ENV === "development" ? "http://localhost:5173" : "https://mixxl.fm";

const allowedOrigins = [
  "http://localhost:5173",
  "https://mixxl.fm",
  "https://www.mixxl.fm",
];

// app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // allow REST clients with no origin (like curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  })
);
// app.options("*", cors({ origin: CORS_ORIGIN, credentials: true }));
// Make sure OPTIONS preflight always responds with headers
// Handle preflight
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  })
);
// 👇 Register webhooks BEFORE JSON body parser
registerWebhooksRoutes(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

(async () => {
  const server = http.createServer(app);

  await registerRoutes(app);

  // 👇 All WS logic moves out
  createWSS(server);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (NODE_ENV === "development") console.error(err);
  });

  if (NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 [${NODE_ENV}] Server running at http://0.0.0.0:${PORT}`);
  });
})();
