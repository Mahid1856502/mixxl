import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RadioPlayer from "@/components/radio/radio-player";
import RadioCoPlayer from "@/components/radio/radio-co-player";
import LiveRadioChat from "@/components/radio/live-radio-chat";
import { useWebSocket } from "@/hooks/use-websocket";
import { Radio, Users } from "lucide-react";
import { useRadioSession } from "@/api/hooks/radio/useRadioSession";
import RadioSessionManager from "@/components/radio/radio-session-calendar";
import { useQueryClient } from "@tanstack/react-query";

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
  const { isConnected, sessionUpdates } = useWebSocket();
  const [selectedSession, setSelectedSession] = useState<RadioSession | null>(
    null
  );

  const queryClient = useQueryClient();
  const { data: activeSession } = useRadioSession();

  useEffect(() => {
    console.log("activeSession change", activeSession);
  }, [activeSession]);

  useEffect(() => {
    console.log("latestRadioUpdate", sessionUpdates);
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

        {/* Live Radio.co Player and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RadioCoPlayer session={activeSession} />
          </div>
          <div>
            <LiveRadioChat key={activeSession?.id} session={activeSession} />
          </div>
        </div>

        <RadioSessionManager />

        {/* <ScheduleWidget /> */}
      </div>
    </div>
  );
}
