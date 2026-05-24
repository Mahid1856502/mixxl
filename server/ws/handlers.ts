import { radioChat, type RadioChatMessageWithUser } from "@shared/schema";
import { db } from "server/db";
import { logServerError, wsErrorPayload } from "../errors";
import { WebSocketServer, WebSocket, RawData } from "ws";

export async function handleMessage(
  wss: WebSocketServer,
  socket: WebSocket,
  raw: RawData
) {
  let msg: { type?: string; sessionId?: string; content?: string; user?: any };

  try {
    msg = JSON.parse(raw.toString());
  } catch {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(wsErrorPayload("Invalid message format"));
    }
    return;
  }

  try {
    switch (msg.type) {
      case "radio_chat": {
        const [saved] = await db
          .insert(radioChat)
          .values({
            sessionId: msg.sessionId!,
            userId: msg.user.id,
            message: msg.content!,
            messageType: "chat",
          })
          .returning();

        const payload: RadioChatMessageWithUser = {
          id: saved.id,
          sessionId: saved.sessionId,
          userId: saved.userId,
          message: saved.message,
          messageType: saved.messageType,
          createdAt: saved.createdAt,
          user: {
            id: msg.user.id,
            username: msg.user.username,
            role: msg.user.role,
            profileImage: msg.user.profileImage ?? null,
          },
        };

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
          }
        });

        break;
      }

      default:
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(wsErrorPayload(`Unknown message type: ${msg.type ?? "none"}`));
        }
    }
  } catch (err) {
    logServerError(err, "ws handleMessage");
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        wsErrorPayload(
          err instanceof Error ? err.message : "Failed to process message"
        )
      );
    }
  }
}
