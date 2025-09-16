// ws.ts
import { WebSocketServer, WebSocket } from "ws";
import { log } from "../vite";
import { handleMessage } from "./handlers";
import url from "url";

let wss: WebSocketServer;

export function createWSS(server: any) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: WebSocket, req) => {
    const { query } = url.parse(req.url!, true);
    (socket as any).userId = query.userId; // 👈 attach to socket

    log(`🔌 WebSocket client connected: ${query.userId}`);
    socket.on("message", (data) => handleMessage(wss, socket, data));
  });

  return wss;
}

// helper to get the WSS instance elsewhere
export function getWSS() {
  if (!wss) throw new Error("WSS not initialized yet");
  return wss;
}
