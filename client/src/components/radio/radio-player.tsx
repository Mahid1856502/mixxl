import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Send,
  Heart,
  MessageCircle,
  Music,
} from "lucide-react";

interface RadioSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  isLive: boolean;
  listenerCount: number;
  currentTrackId?: string;
}

interface ChatMessage {
  id: string;
  user: {
    id: string;
    username: string;
    profileImage?: string;
  };
  message: string;
  timestamp: string;
  type: "chat" | "reaction" | "system";
}

interface RadioPlayerProps {
  session: RadioSession;
  onClose?: () => void;
}

export default function RadioPlayer({ session, onClose }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, messages, joinRadio, sendRadioChat } = useWebSocket();

  useEffect(() => {
    if (session && isConnected) {
      joinRadio(session.id);
    }
  }, [session, isConnected, joinRadio]);

  useEffect(() => {
    // Listen for WebSocket messages
    messages.forEach((message) => {
      if (message.type === "radio_chat" && message.sessionId === session.id) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            user: message.user,
            message: message.message,
            timestamp: message.timestamp,
            type: "chat",
          },
        ]);
      }
    });
  }, [messages, session.id]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Radio Paused" : "Radio Playing",
      description: session.title,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user) return;

    sendRadioChat(session.id, chatMessage);
    setChatMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendReaction = (emoji: string) => {
    if (!user) return;

    sendRadioChat(session.id, emoji);
    toast({
      title: "Reaction sent!",
      description: emoji,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Radio Player */}
      <div className="lg:col-span-2 space-y-6">
        {/* Now Playing */}
        <Card className="glass-effect border-white/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Live Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
                <Badge variant="destructive" className="bg-red-500">
                  LIVE RADIO
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{session.listenerCount}</span>
                </div>
              </div>

              {/* Station Info */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold mixxl-gradient-text">
                  {session.title}
                </h1>
                {session.description && (
                  <p className="text-muted-foreground">{session.description}</p>
                )}
              </div>

              {/* Currently Playing */}
              {currentTrack ? (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">Now Playing</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      {currentTrack.coverImage ? (
                        <img
                          src={currentTrack.coverImage}
                          alt={currentTrack.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Music className="w-8 h-8 text-white/50" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{currentTrack.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Artist Name
                      </p>
                    </div>
                  </div>

                  {/* Audio Visualizer */}
                  <div className="flex items-center justify-center space-x-1 h-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full audio-visualizer"
                        style={{
                          height: `${Math.random() * 100 + 20}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-8 text-center">
                  <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Connecting to radio stream...
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handlePlay}
                  className="mixxl-gradient text-white w-16 h-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Quick Reactions */}
              <div className="flex items-center justify-center space-x-2">
                {["🔥", "💜", "🎵", "👏", "😍"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    size="sm"
                    onClick={() => sendReaction(emoji)}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Host Info */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="w-5 h-5" />
              <span>Radio Host</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt="Host" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  H
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Host Name</h3>
                <p className="text-sm text-muted-foreground">
                  Radio DJ & Music Curator
                </p>
              </div>
              <Button variant="outline" className="ml-auto">
                Follow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <div className="space-y-4">
        <Card className="glass-effect border-white/10 h-96">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Live Chat</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {session.listenerCount} listeners
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 px-4 radio-chat">
              <div className="space-y-3 pb-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Be the first to chat!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={msg.user.profileImage || ""}
                          alt={msg.user.username}
                        />
                        <AvatarFallback className="text-xs">
                          {msg.user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-primary">
                            {msg.user.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            {user ? (
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border-white/10"
                    maxLength={200}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || !isConnected}
                    className="mixxl-gradient text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-amber-500 mt-1">
                    Connecting to chat...
                  </p>
                )}
              </div>
            ) : (
              <div className="border-t border-white/10 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Sign in to join the chat
                </p>
                <Button size="sm" className="mixxl-gradient text-white">
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
