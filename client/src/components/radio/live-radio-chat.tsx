import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/provider/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { MessageCircle, Send } from "lucide-react";
import { RadioChatMessageWithUser, RadioSession } from "@shared/schema";
import { useRadioChatBySession } from "@/api/hooks/radio/chat/useRadioChat";

interface LiveRadioChatProps {
  session?: RadioSession & {
    host: {
      id: string;
      username: string;
      profileImage: string | null;
      bio: string | null;
    } | null;
  };
  className?: string;
}

export default function LiveRadioChat({
  session,
  className = "",
}: LiveRadioChatProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<RadioChatMessageWithUser[]>(
    []
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { isConnected, messages: wsMessages, sendRadioChat } = useWebSocket();
  const [, setLocation] = useLocation();

  const { data: initialMessages = [] } = useRadioChatBySession(
    session?.id,
    user?.id
  );

  const hasLoadedInitialMessages = useRef(false);

  useEffect(() => {
    if (!hasLoadedInitialMessages.current && initialMessages.length) {
      setChatMessages(initialMessages);
      hasLoadedInitialMessages.current = true;
    }
  }, [initialMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current?.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  // Merge WebSocket messages into local state
  useEffect(() => {
    const newRadioMessages: RadioChatMessageWithUser[] = wsMessages
      .filter((msg) => msg.messageType === "chat" && msg.user) // make sure user exists
      .map((msg) => ({
        id: msg.id,
        sessionId: msg.sessionId,
        userId: msg.userId,
        message: msg.message,
        messageType: msg.messageType ?? "chat",
        createdAt: new Date(msg.createdAt),
        user: {
          id: msg.user!.id,
          username: msg.user!.username,
          role: msg.user!.role,
          profileImage: msg.user!.profileImage ?? null,
        },
      }));

    setChatMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      return [
        ...prev,
        ...newRadioMessages.filter((m) => !existingIds.has(m.id)),
      ];
    });
  }, [wsMessages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user || !isConnected || !session?.id) return;
    sendRadioChat(session.id, chatMessage);
    setChatMessage("");
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatMessage((prev) => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendReaction = (emoji: string) => {
    if (!user || !isConnected || !session?.id) return;
    sendRadioChat(session.id, emoji);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "artist":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card className={`glass-effect border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Live Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-96">
        <div
          ref={scrollAreaRef}
          className="flex-1 p-4 overflow-y-auto space-y-3"
        >
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {user
                  ? "Be the first to chat during the live broadcast!"
                  : "Sign In to interact with community chat"}
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage
                    className="object-cover"
                    src={msg.user?.profileImage ?? ""}
                    alt={msg.user?.username}
                  />
                  <AvatarFallback className="text-xs">
                    {msg.user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-primary">
                      {msg.user?.username}
                    </span>
                    {msg.user?.role !== "fan" && (
                      <Badge
                        className={`text-xs px-1 py-0 ${getRoleBadgeColor(
                          msg.user?.role
                        )} text-white`}
                      >
                        {msg.user?.role?.toUpperCase()}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-2 flex items-center justify-center space-x-2">
          {["🔥", "💜", "🎵", "👏", "😍", "🎉"].map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => sendReaction(emoji)}
              disabled={!user || !isConnected}
              className="text-lg hover:scale-110 transition-transform p-1 h-8 w-8"
            >
              {emoji}
            </Button>
          ))}
        </div>

        {user ? (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Chat with the community..."
                  className="flex-1 bg-white/5 border-white/10"
                  maxLength={200}
                  disabled={!isConnected || !session?.id}
                />
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  className="glass-effect border-white/10 bg-white/5 hover:bg-white/10"
                />
              </div>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || !isConnected || !session?.id}
                className="mixxl-gradient text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
              <span className="text-xs text-muted-foreground">
                {chatMessage.length}/200
              </span>
            </div>
          </div>
        ) : (
          <div className="border-t border-white/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Sign in to join the live chat
            </p>
            <Button
              size="sm"
              className="mixxl-gradient text-white"
              onClick={() => setLocation("/login")}
            >
              Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
