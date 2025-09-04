import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { createWSS } from "./ws"; // 👈 our new module

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = parseInt(process.env.PORT || "5000", 10);

const CORS_ORIGIN =
  NODE_ENV === "development" ? "http://localhost:5173" : "https://mixxl.fm";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.options("*", cors({ origin: CORS_ORIGIN, credentials: true }));

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
