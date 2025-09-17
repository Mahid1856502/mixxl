import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [sessionUpdates, setSessionUpdates] = useState<WebSocketMessage | null>(
    null
  );

  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const reconnectInterval = useRef(1000); // start with 1 second

  useEffect(() => {
    if (!user) return;

    let shouldReconnect = true;

    const connect = () => {
      const wsUrl =
        process.env.NODE_ENV === "development"
          ? `ws://localhost:3000/ws?userId=${user.id}`
          : `wss://server1.mixxl.fm/ws?userId=${user.id}`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
        reconnectInterval.current = 1000; // reset interval on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "radio_session_updated") {
            setSessionUpdates(message);
          } else {
            setMessages((prev) => [...prev, message]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
        if (shouldReconnect) {
          setTimeout(connect, reconnectInterval.current);
          reconnectInterval.current = Math.min(
            reconnectInterval.current * 2,
            30000
          ); // exponential backoff
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.current?.close(); // triggers onclose
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      ws.current?.close();
    };
  }, [user]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const joinRadio = (sessionId: string) => {
    sendMessage({
      type: "join_radio",
      sessionId,
      user: user,
    });
  };

  const sendRadioChat = (sessionId: string, content: string) => {
    sendMessage({
      type: "radio_chat",
      sessionId,
      content,
      user: user,
    });
  };

  return {
    isConnected,
    messages,
    sessionUpdates,
    sendMessage,
    joinRadio,
    sendRadioChat,
  };
}
