import { radioChat, type RadioChatMessageWithUser } from "@shared/schema";
import { db } from "server/db";
import { log } from "server/vite";
import { WebSocketServer, WebSocket, RawData } from "ws";

export async function handleMessage(
  wss: WebSocketServer,
  socket: WebSocket,
  raw: RawData
) {
  const msg = JSON.parse(raw.toString());

  switch (msg.type) {
    case "radio_chat": {
      // persist
      const [saved] = await db
        .insert(radioChat)
        .values({
          sessionId: msg.sessionId,
          userId: msg.user.id,
          message: msg.content,
          messageType: "chat",
        })
        .returning();

      // construct payload matching RadioChatMessageWithUser
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

      console.log("payload", payload);

      // broadcast
      wss.clients.forEach((client) => {
        if (client.readyState === socket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });

      break;
    }

    default:
      console.log("⚠️ Unknown message type:", msg.type);
  }
}
