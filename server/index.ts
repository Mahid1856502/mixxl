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
    Sentry.expressIntegration(),
    Sentry.httpIntegration(),
    Sentry.nativeNodeFetchIntegration(),
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

      const scope = Sentry.getCurrentScope();
      if (scope) {
        scope.setUser({ id: user.id, email: user.email });
        scope.setTag("role", user.role);
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
      if (!origin) return callback(null, true);
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
// 🔹 Async handler helper
// ---------------------------------------------------------
function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Optional: wrap all routes automatically after registration
function wrapAsyncRoutes(app: express.Express) {
  app._router.stack.forEach((layer: any) => {
    if (layer.route) {
      layer.route.stack.forEach((routeLayer: any) => {
        const original = routeLayer.handle;
        if (!original._isAsyncWrapped) {
          routeLayer.handle = asyncHandler(original);
          routeLayer.handle._isAsyncWrapped = true;
        }
      });
    }
  });
}

// ---------------------------------------------------------
// 🚀 Main bootstrap
// ---------------------------------------------------------
(async () => {
  const server = http.createServer(app);

  // 1️⃣ API routes
  await registerRoutes(app);

  // 2️⃣ Wrap all async routes automatically
  wrapAsyncRoutes(app);

  // 3️⃣ WebSocket server
  createWSS(server);

  // ---------------------------------------------------------
  // 🔴 Error Handling Middleware (Sentry + Logger)
  // ---------------------------------------------------------
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    Sentry.captureException(err); // Send error to Sentry
    console.error("Unhandled error:", err);

    // Handle Stripe specific errors if desired
    if (err.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        message: "Stripe account is invalid or missing required information",
        details: err.message,
      });
    }

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
