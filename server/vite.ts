import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const viteLogger = createLogger();

function debugLog(message: string, context = "vite") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  debugLog("Setting up Vite in middleware mode...");

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  let vite;
  try {
    vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          debugLog(`Vite error: ${msg}`, "vite");
        },
        warn: (msg, options) => {
          viteLogger.warn(msg, options);
          debugLog(`Vite warning: ${msg}`, "vite");
        },
        info: (msg, options) => {
          viteLogger.info(msg, options);
          debugLog(`Vite info: ${msg}`, "vite");
        },
      },
      server: serverOptions,
      appType: "custom",
    });
    debugLog("Vite server created successfully.");
  } catch (err) {
    debugLog(`Failed to create Vite server: ${(err as Error).stack}`, "vite");
    throw err;
  }

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    debugLog(`Handling request for URL: ${url}`, "vite");

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client/src",
        "index.html"
      );

      debugLog(`Reading template file: ${clientTemplate}`, "vite");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);

      debugLog(`Sending transformed HTML for URL: ${url}`, "vite");
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      debugLog(`Error in Vite request handler: ${(e as Error).stack}`, "vite");
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  debugLog(`Serving static files from: ${distPath}`, "static");

  if (!fs.existsSync(distPath)) {
    const errorMsg = `Could not find the build directory: ${distPath}, make sure to build the client first`;
    debugLog(errorMsg, "static");
    throw new Error(errorMsg);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexFile = path.resolve(distPath, "index.html");
    debugLog(`Falling back to index.html: ${indexFile}`, "static");
    res.sendFile(indexFile);
  });
}
