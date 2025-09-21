import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RadioPlayer from "@/components/radio/radio-player";
import RadioCoPlayer from "@/components/radio/radio-co-player";
import LiveRadioChat from "@/components/radio/live-radio-chat";
import { useWebSocket } from "@/hooks/use-websocket";
import { Radio, Users } from "lucide-react";
import { useRadioSession } from "@/api/hooks/radio/useRadioSession";
import RadioSessionManager from "@/components/radio/radio-session-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { useTracks } from "@/api/hooks/tracks/useTracks";
import { useQueryParams } from "@/hooks/use-query-params";
import { TrackExtended } from "@shared/schema";

interface RadioSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  isLive: boolean;
  listenerCount: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
}

export default function RadioPage() {
  const [params, setParams] = useQueryParams({
    tab: "tracks",
  });

  const { isConnected, sessionUpdates } = useWebSocket();
  const [selectedSession, setSelectedSession] = useState<RadioSession | null>(
    null
  );

  const queryClient = useQueryClient();
  const { data: activeSession } = useRadioSession();
  const { data: tracksData } = useTracks({
    submitToRadio: true,
    enable: params.tab === "tracks",
  });

  useEffect(() => {
    if (sessionUpdates?.type === "radio_session_updated") {
      queryClient.invalidateQueries({ queryKey: ["radioSession"] });
      queryClient.refetchQueries({ queryKey: ["radioSession"] });
      queryClient.setQueryData(["radioSession"], null);
    }
  }, [sessionUpdates, queryClient]);

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
            <h1 className="text-4xl font-bold mixxl-gradient-text">
              Mixxl Radio
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tune in to live radio sessions, discover new music, and connect with
            the community
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span>{isConnected ? "Connected" : "Connecting..."}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{activeSession?.listenerCount ?? 0} listening</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RadioCoPlayer session={activeSession} />
          </div>
          <div>
            <LiveRadioChat key={activeSession?.id} session={activeSession} />
          </div>
        </div>

        {/* Tabs: Sessions + Tracks */}
        <Tabs
          defaultValue="sessions"
          className="w-full"
          value={params.tab}
          onValueChange={(tab) => setParams({ tab })}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <RadioSessionManager />
          </TabsContent>

          {/* Tracks Tab */}
          <TabsContent value="tracks">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Submitted Tracks</h2>
              {tracksData?.length ? (
                <ul className="space-y-2">
                  {tracksData.map((track: TrackExtended) => (
                    <li
                      key={track.id}
                      className="bg-card p-4 border rounded-lg shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {track.artistName ?? "Unknown Artist"}
                        </p>
                      </div>

                      {track.fileUrl && (
                        <Button>
                          <a
                            href={track.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm"
                          >
                            Open File
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No tracks submitted yet.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
