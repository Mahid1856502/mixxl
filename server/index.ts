// ---------------------------------------------------------
// 📦 Imports
// ---------------------------------------------------------
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import cors from "cors";
import "dotenv/config";
import jwt from "jsonwebtoken";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createWSS } from "./ws";
import { registerWebhooksRoutes } from "./webhooks";

// Database
import { db } from "./db";
import { eq } from "drizzle-orm";

// Sentry 8+
import * as Sentry from "@sentry/node";
import "@sentry/tracing";

import { User, users } from "@shared/schema";

// ---------------------------------------------------------
// 🔧 Core Setup
// ---------------------------------------------------------
const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = parseInt(process.env.PORT || "5000", 10);

const allowedOrigins = [
  "http://localhost:5173",
  "https://mixxl.fm",
  "https://www.mixxl.fm",
];

// ---------------------------------------------------------
// 🟣 Sentry Initialization (v8)
// ---------------------------------------------------------
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: NODE_ENV,
  tracesSampleRate: 0.2,
  integrations: [
    Sentry.expressIntegration(), // ✅ no args
    Sentry.httpIntegration(), // optional: outgoing HTTP requests
    Sentry.nativeNodeFetchIntegration(), // optional: fetch/undici instrumentation
  ],
});

// ---------------------------------------------------------
// 🟢 JWT Middleware + Sentry user context
// ---------------------------------------------------------
declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}

app.use(async (req, _res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return next();

  const token = auth.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user) {
      req.user = user;

      // ✅ Sentry 8 way: get current scope for this request
      const scope = Sentry.getCurrentScope();
      if (scope) {
        scope.setUser({ id: user.id, email: user.email });
        scope.setTag("role", user.role); // optional: attach more info
      }
    }
  } catch {
    log("Invalid JWT provided");
  }

  next();
});

// ---------------------------------------------------------
// 🟦 CORS Configuration
// ---------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  })
);

app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  })
);

// ---------------------------------------------------------
// 🟣 Webhooks BEFORE JSON parser
// ---------------------------------------------------------
registerWebhooksRoutes(app);

// ---------------------------------------------------------
// 📦 Body Parser + Static
// ---------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------------------------------------------------------
// 🚀 Main bootstrap
// ---------------------------------------------------------
(async () => {
  const server = http.createServer(app);

  // API routes
  await registerRoutes(app);

  // WebSocket server
  createWSS(server);

  // ---------------------------------------------------------
  // 🔴 Error Handling (Sentry + Logger)
  // ---------------------------------------------------------
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    Sentry.captureException(err); // send error to Sentry
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: "Internal Server Error" });
  });

  // ---------------------------------------------------------
  // 🟩 Vite dev / production
  // ---------------------------------------------------------
  if (NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ---------------------------------------------------------
  // 🚀 Start server
  // ---------------------------------------------------------
  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 [${NODE_ENV}] Server running at http://0.0.0.0:${PORT}`);
  });
})();
