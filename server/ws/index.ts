// ws.ts
import { WebSocketServer, WebSocket } from "ws";
import { log } from "../log";
import { logServerError, wsErrorPayload } from "../errors";
import { handleMessage } from "./handlers";
import url from "url";

let wss: WebSocketServer;

export function createWSS(server: any) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: WebSocket, req) => {
    const { query } = url.parse(req.url!, true);
    (socket as any).userId = query.userId;

    log(`🔌 WebSocket client connected: ${query.userId}`);

    socket.on("message", (data) => {
      handleMessage(wss, socket, data).catch((err) => {
        logServerError(err, "ws message");
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(wsErrorPayload("Failed to process message"));
        }
      });
    });

    socket.on("error", (err) => {
      logServerError(err, "ws socket");
    });
  });

  return wss;
}

// helper to get the WSS instance elsewhere
export function getWSS() {
  if (!wss) throw new Error("WSS not initialized yet");
  return wss;
}
