import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Heart, 
  MessageCircle, 
  Send,
  DollarSign,
  Eye,
  Clock
} from "lucide-react";

interface LiveStream {
  id: string;
  artistId: string;
  title: string;
  description: string;
  status: string;
  viewerCount: number;
  totalTips: string;
  startedAt: string;
  createdAt: string;
}

interface StreamMessage {
  id: string;
  userId: string;
  message: string;
  isTip: boolean;
  tipAmount?: string;
  createdAt: string;
}

export default function LiveStreamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get active streams
  const { data: activeStreams = [] } = useQuery<LiveStream[]>({
    queryKey: ["/api/livestreams"],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Start stream mutation
  const startStreamMutation = useMutation({
    mutationFn: async (streamData: { title: string; description: string }) => {
      const response = await apiRequest("POST", "/api/livestreams", streamData);
      return response.json();
    },
    onSuccess: (stream) => {
      toast({
        title: "Stream created!",
        description: "Your live stream is ready to start",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/livestreams"] });
      startBroadcast(stream.id);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create stream",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Setup WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'stream_started':
          queryClient.invalidateQueries({ queryKey: ["/api/livestreams"] });
          break;
        case 'stream_ended':
          queryClient.invalidateQueries({ queryKey: ["/api/livestreams"] });
          break;
        case 'stream_message':
          // Handle new chat messages
          break;
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  // Start broadcasting
  const startBroadcast = async (streamId: string) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start the stream on server
      await apiRequest("POST", `/api/livestreams/${streamId}/start`);
      setIsStreaming(true);

      toast({
        title: "Going live!",
        description: "Your stream is now broadcasting",
      });
    } catch (error) {
      toast({
        title: "Failed to start broadcast",
        description: "Could not access camera/microphone",
        variant: "destructive",
      });
    }
  };

  // Stop broadcasting
  const stopBroadcast = async (streamId: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      await apiRequest("POST", `/api/livestreams/${streamId}/end`);
      setIsStreaming(false);

      toast({
        title: "Stream ended",
        description: "You are no longer broadcasting",
      });
    } catch (error) {
      toast({
        title: "Error ending stream",
        description: "There was an issue stopping the broadcast",
        variant: "destructive",
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Handle going live
  const handleGoLive = () => {
    const title = prompt("Stream title:");
    const description = prompt("Stream description (optional):");
    
    if (title) {
      startStreamMutation.mutate({ title, description: description || "" });
    }
  };

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    // TODO: Send to active stream when implemented
    console.log("Sending message:", chatMessage);
    setChatMessage("");
  };

  // Handle tip
  const handleTip = (amount: string) => {
    const numAmount = parseFloat(amount.replace('£', ''));
    console.log("Tipping:", numAmount);
    // TODO: Implement actual tipping when stream is active
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to access live streams</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mixxl-gradient-text">Live Streams</h1>
            <p className="text-muted-foreground">Connect with your audience in real-time</p>
          </div>
          
          {user.role === "artist" && !isStreaming && (
            <Button 
              onClick={handleGoLive}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <Video className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Broadcasting Panel (for artists) */}
            {user.role === "artist" && isStreaming && (
              <Card className="glass-effect border-red-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span>You're Live!</span>
                    </CardTitle>
                    <Button 
                      onClick={() => stopBroadcast("current-stream-id")}
                      variant="destructive"
                      size="sm"
                    >
                      End Stream
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isVideoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <VideoOff className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "outline" : "destructive"}
                      size="sm"
                    >
                      {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "outline" : "destructive"}
                      size="sm"
                    >
                      {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Streams */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Live Now</h2>
              {(activeStreams as LiveStream[]).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
                    <p className="text-muted-foreground">
                      Be the first to go live and connect with your audience!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeStreams as LiveStream[]).map((stream: LiveStream) => (
                    <Card key={stream.id} className="glass-effect hover:border-red-500/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-red-500 text-white">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                            LIVE
                          </Badge>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span>{stream.viewerCount}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold mb-2">{stream.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {stream.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">Artist Name</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-green-500">
                            <DollarSign className="w-4 h-4" />
                            <span>£{stream.totalTips}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2 p-2">
                    <div className="text-center text-sm text-muted-foreground">
                      Chat will appear here when you join a stream
                    </div>
                  </div>
                </ScrollArea>
                
                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Say something..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        sendChatMessage();
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="shrink-0"
                    onClick={sendChatMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tip */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Show Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {["£1", "£5", "£10"].map((amount) => (
                    <Button 
                      key={amount} 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTip(amount)}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                <Button 
                  className="w-full mixxl-gradient text-white hover:opacity-90"
                  onClick={() => {
                    const amount = prompt("Enter tip amount (£):");
                    if (amount && !isNaN(parseFloat(amount))) {
                      handleTip(`£${amount}`);
                    }
                  }}
                >
                  <span className="w-4 h-4 mr-2">£</span>
                  Custom Tip
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}