import "dotenv/config";
import { startServer } from "./bootstrap";

const frontend =
  process.env.NODE_ENV === "development"
    ? "vite"
    : process.env.SERVE_STATIC !== "false"
      ? "static"
      : "none";

startServer(frontend);
