import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import http, { type Server } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";

import { registerRoutes } from "./routes";
import { log } from "./log";
import { createWSS } from "./ws";
import { registerWebhooksRoutes } from "./webhooks";

import { db } from "./db";
import { eq } from "drizzle-orm";

import * as Sentry from "@sentry/node";
import "@sentry/tracing";

import { User, users } from "@shared/schema";
import {
  errorMiddleware,
  logServerError,
  registerProcessErrorHandlers,
} from "./errors";

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = parseInt(process.env.PORT || "5000", 10);

const allowedOrigins = [
  "http://localhost:5173",
  "https://mixxl.fm",
  "https://mixxl.vercel.app",
  "https://www.mixxl.fm",
];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: NODE_ENV,
  tracesSampleRate: 0.2,
  integrations: [
    Sentry.expressIntegration(),
    Sentry.httpIntegration(),
    Sentry.nativeNodeFetchIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
});

registerProcessErrorHandlers();

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
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      log("Invalid JWT provided");
      return next();
    }
    return next(err);
  }

  next();
});

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

registerWebhooksRoutes(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

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

export async function startCore() {
  const server = http.createServer(app);

  server.on("error", (err) => {
    logServerError(err, "http.Server");
  });

  try {
    await registerRoutes(app);
  } catch (err) {
    logServerError(err, "registerRoutes");
    throw err;
  }

  wrapAsyncRoutes(app);
  createWSS(server);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use(errorMiddleware);

  return { app, server };
}

export function listen(server: Server) {
  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 [${NODE_ENV}] Server running at http://0.0.0.0:${PORT}`);
  });
}
