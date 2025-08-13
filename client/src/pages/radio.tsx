import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RadioPlayer from "@/components/radio/radio-player";
import RadioCoPlayer from "@/components/radio/radio-co-player";
import LiveRadioChat from "@/components/radio/live-radio-chat";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Radio, 
  Users, 
  Calendar, 
  Clock, 
  Play,
  Pause,
  Volume2,
  Heart,
  Share,
  Plus,
  Headphones,
  Mic,
  House
} from "lucide-react";

interface RadioSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  isLive: boolean;
  listenerCount: number;
  currentTrackId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
}

export default function RadioPage() {
  const { user } = useAuth();
  const { isConnected, messages } = useWebSocket();
  const [selectedSession, setSelectedSession] = useState<RadioSession | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery<RadioSession[]>({
    queryKey: ["/api/radio/sessions"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: upcomingSessions = [] } = useQuery<RadioSession[]>({
    queryKey: ["/api/radio/upcoming"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: pastSessions = [] } = useQuery<RadioSession[]>({
    queryKey: ["/api/radio/past"],
    staleTime: 10 * 60 * 1000,
  });

  // Auto-select first active session
  useEffect(() => {
    if (activeSessions.length > 0 && !selectedSession) {
      setSelectedSession(activeSessions[0]);
    }
  }, [activeSessions, selectedSession]);

  // Listen for new radio sessions via WebSocket
  useEffect(() => {
    const newSessionMessages = messages.filter(msg => msg.type === 'new_radio_session');
    if (newSessionMessages.length > 0) {
      // Could show notification about new live session
    }
  }, [messages]);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return "Duration unknown";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    return `${duration} minutes`;
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSession(null)}
              className="mb-4"
            >
              ← Back to Radio
            </Button>
          </div>
          
          <RadioPlayer 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Radio className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold mixxl-gradient-text">Mixxl Radio</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tune in to live radio sessions, discover new music, and connect with the community
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{activeSessions.reduce((sum: number, session: any) => sum + session.listenerCount, 0)} listening</span>
            </div>
            <div className="flex items-center space-x-2">
              <House className="w-4 h-4" />
              <span>{activeSessions.length} live sessions</span>
            </div>
          </div>
        </div>

        {/* Live Radio.co Player and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radio.co Player */}
          <div className="lg:col-span-2">
            <RadioCoPlayer 
              isLive={true}
              listenerCount={activeSessions.reduce((sum: number, session: RadioSession) => sum + session.listenerCount, 0)}
              stationName="Mixxl Radio"
            />
          </div>
          
          {/* Live Chat */}
          <div>
            <LiveRadioChat 
              listenerCount={activeSessions.reduce((sum: number, session: RadioSession) => sum + session.listenerCount, 0)}
            />
          </div>
        </div>

        {/* House Sessions */}
        {activeSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
                <span>Live Sessions</span>
              </h2>
              <Badge variant="destructive" className="bg-red-500">
                {activeSessions.length} LIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="glass-effect border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10 cursor-pointer hover:border-red-500/50 transition-all group"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Session Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive" className="bg-red-500 text-xs">
                              LIVE
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{session.listenerCount}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {session.title}
                          </h3>
                        </div>
                        <Button 
                          size="icon" 
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.description}
                        </p>
                      )}

                      {/* Host Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt="Host" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            H
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Host Name</p>
                          <p className="text-xs text-muted-foreground">Radio DJ</p>
                        </div>
                      </div>

                      {/* Current Track */}
                      {session.currentTrackId && (
                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-muted-foreground">Now Playing</p>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Headphones className="w-4 h-4 text-white/70" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Track Title</p>
                              <p className="text-xs text-muted-foreground">Artist Name</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
                        >
                          <Radio className="w-4 h-4 mr-2" />
                          Listen House
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {activeSessions.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-16 text-center">
                  <Radio className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <h3 className="text-2xl font-semibold mb-4">No House Sessions</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    There are no live radio sessions at the moment. Check the schedule for upcoming shows or start your own!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Radio broadcasting is managed by the Mixxl team. Artists can submit tracks for radio playlist consideration during upload.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Featured Session */}
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle>Featured Radio Shows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeSessions.slice(0, 3).map((session) => (
                        <div 
                          key={session.id}
                          className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedSession(session)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="destructive" className="bg-red-500 text-xs">LIVE</Badge>
                              <span className="text-sm text-muted-foreground">{session.listenerCount} listeners</span>
                            </div>
                            <h4 className="font-semibold">{session.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {session.description}
                            </p>
                            <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white">
                              Join Session
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Genres */}
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle>Popular Radio Genres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["Electronic", "Hip Hop", "Indie", "Jazz"].map((genre) => (
                        <div key={genre} className="p-4 text-center border border-white/10 rounded-lg hover:border-white/20 transition-colors cursor-pointer">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <Radio className="w-6 h-6 text-white/70" />
                          </div>
                          <p className="font-medium">{genre}</p>
                          <p className="text-xs text-muted-foreground">2 live shows</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Shows</h2>
              {user?.role === "admin" && (
                <Button className="mixxl-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Radio Schedule
                </Button>
              )}
            </div>

            {upcomingSessions.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Shows</h3>
                  <p className="text-muted-foreground">
                    No radio shows are scheduled yet. Check back later or schedule your own!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="glass-effect border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <p className="text-muted-foreground">{session.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateTime(session.scheduledStart)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(session.scheduledStart, session.scheduledEnd)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button>
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <h2 className="text-2xl font-bold">Past Shows</h2>

            {pastSessions.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No Past Shows</h3>
                  <p className="text-muted-foreground">
                    Radio show recordings will appear here after they finish
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSessions.map((session) => (
                  <Card key={session.id} className="glass-effect border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">{session.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateTime(session.actualStart)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(session.actualStart, session.actualEnd)}</span>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Listen to Recording
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
