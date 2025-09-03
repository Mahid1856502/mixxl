// ws.ts
import { WebSocketServer, WebSocket } from "ws";
import { log } from "../vite";
import { handleMessage } from "./handlers";

let wss: WebSocketServer;

export function createWSS(server: any) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: WebSocket) => {
    log("🔌 WebSocket client connected");
    socket.on("message", (data) => handleMessage(wss, socket, data));

    socket.send(JSON.stringify({ type: "welcome", message: "Hello from WS!" }));
  });

  return wss;
}

// helper to get the WSS instance elsewhere
export function getWSS() {
  if (!wss) throw new Error("WSS not initialized yet");
  return wss;
}
