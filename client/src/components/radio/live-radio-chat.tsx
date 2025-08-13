import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { MessageCircle, Send, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  user: {
    id: string;
    username: string;
    role: string;
    profileImage?: string;
  };
  message: string;
  timestamp: string;
  type: 'chat' | 'reaction' | 'system';
}

interface LiveRadioChatProps {
  listenerCount?: number;
  className?: string;
}

export default function LiveRadioChat({ listenerCount = 0, className = "" }: LiveRadioChatProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, messages, sendRadioChat } = useWebSocket();
  const [, setLocation] = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Listen for WebSocket messages
  useEffect(() => {
    const newRadioMessages = messages.filter(msg => msg.type === 'radio_chat');
    newRadioMessages.forEach(message => {
      setChatMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.find(m => m.id === message.id)) return prev;
        
        return [...prev, {
          id: message.id || Date.now().toString(),
          user: message.user,
          message: message.message,
          timestamp: message.timestamp || new Date().toISOString(),
          type: message.messageType || 'chat'
        }];
      });
    });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user || !isConnected) return;

    sendRadioChat('radio-main', chatMessage);
    setChatMessage("");
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatMessage(prev => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendReaction = (emoji: string) => {
    if (!user || !isConnected) return;
    
    sendRadioChat('radio-main', emoji);
    toast({
      title: "Reaction sent!",
      description: emoji,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'artist': return 'bg-purple-500';
      default: return 'bg-blue-500';
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
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {listenerCount}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-96">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Be the first to chat during the live broadcast!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={msg.user.profileImage || ""} alt={msg.user.username} />
                    <AvatarFallback className="text-xs">
                      {msg.user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-primary">
                        {msg.user.username}
                      </span>
                      {msg.user.role !== 'fan' && (
                        <Badge 
                          className={`text-xs px-1 py-0 ${getRoleBadgeColor(msg.user.role)} text-white`}
                        >
                          {msg.user.role.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Quick Reactions */}
        <div className="border-t border-white/10 px-4 py-2">
          <div className="flex items-center justify-center space-x-2">
            {['🔥', '💜', '🎵', '👏', '😍', '🎉'].map((emoji) => (
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
        </div>

        {/* Chat Input */}
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
                  disabled={!isConnected}
                />
                <EmojiPicker 
                  onEmojiSelect={handleEmojiSelect}
                  className="glass-effect border-white/10 bg-white/5 hover:bg-white/10"
                />
              </div>
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || !isConnected}
                className="mixxl-gradient text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Connecting...'}
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
              onClick={() => setLocation('/login')}
            >
              Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}