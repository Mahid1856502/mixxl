import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // const wsUrl = `${protocol}//${window.location.host}/ws`;

    const wsUrl =
      process.env.NODE_ENV === "development"
        ? "ws://localhost:3000/ws"
        : "wss://mixxl.fm/ws";

    // const wsUrl =
    //   window.location.protocol === "https:"
    //     ? "wss://localhost:3000/ws"
    //     : "ws://localhost:3000/ws";
    // ws.current = new WebSocket(wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
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
    sendMessage,
    joinRadio,
    sendRadioChat,
  };
}
