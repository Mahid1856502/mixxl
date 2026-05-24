import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { log } from "./log";

export function logServerError(err: unknown, context?: string) {
  const prefix = context ? `[${context}] ` : "";
  if (err instanceof Error) {
    console.error(`${prefix}${err.message}`, err.stack);
    try {
      Sentry.captureException(err);
    } catch {
      /* Sentry optional */
    }
  } else {
    console.error(`${prefix}${String(err)}`);
    try {
      Sentry.captureException(new Error(String(err)));
    } catch {
      /* Sentry optional */
    }
  }
}

/** Keep the process alive; log and report only. */
export function registerProcessErrorHandlers() {
  process.on("uncaughtException", (err: Error) => {
    logServerError(err, "uncaughtException");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logServerError(reason, "unhandledRejection");
  });
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function statusFromError(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  if (!err || typeof err !== "object") return 500;
  const e = err as { status?: number; statusCode?: number };
  return e.status ?? e.statusCode ?? 500;
}

/** Safe message for API clients (no stack traces). */
export function clientErrorMessage(err: unknown, status: number): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Request failed";

  if (status >= 500) {
    return process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : message || "Internal Server Error";
  }

  return message || "Bad Request";
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (res.headersSent) {
    return;
  }

  logServerError(err, `${req.method} ${req.path}`);

  const errObj = err as { type?: string; message?: string };

  if (errObj?.type === "StripeInvalidRequestError") {
    return res.status(400).json({
      message: "Stripe account is invalid or missing required information",
      details: errObj.message,
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }

  if (errObj?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: errObj.message });
  }

  const status = statusFromError(err);
  res.status(status).json({
    message: clientErrorMessage(err, status),
  });
}

export function wsErrorPayload(message: string) {
  return JSON.stringify({ type: "error", message });
}
