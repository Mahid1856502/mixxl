import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import { RadioSession } from "@shared/schema";
import { useRadioStatus } from "@/api/hooks/radio/useRadioStatus";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BASE_URL } from "@/lib/queryClient";
import { useEndSession } from "@/api/hooks/radio/useSessionStatus";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/use-auth";

interface RadioCoPlayerProps {
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

export const RADIO_CO_STREAM_ID = import.meta.env.VITE_RADIO_CO_STREAM_ID;

export default function RadioCoPlayer({
  session,
  className = "",
}: RadioCoPlayerProps) {
  const { user } = useAuth();
  const { status, loading } = useRadioStatus(RADIO_CO_STREAM_ID);
  const { mutate: endSession, isPending: ending } = useEndSession();

  const handleEndSession = () => {
    if (session?.id) {
      endSession(session.id);
    }
  };

  return (
    <Card className={`glass-effect border-white/10 h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {session?.title ?? "Mixxl Radio"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {session?.isLive && status?.status === "online" && (
                <Badge
                  variant="destructive"
                  className="bg-red-500 animate-pulse"
                >
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Track + Host info */}
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        ) : status?.status === "online" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                {session?.host ? (
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarImage
                      className="object-cover"
                      src={
                        session?.host?.profileImage
                          ? `${BASE_URL}${session?.host?.profileImage}`
                          : ""
                      }
                      alt={session?.host?.username}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session?.host?.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Radio className="w-10 h-10 opacity-50" />
                )}
                {session?.host && (
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {session.host.username}
                    </p>
                    {session.host.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.host.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {status.current_track?.title ?? "Live Broadcast"}
              </span>
              <p className="text-xs text-muted-foreground">
                {status.source?.type === "automated" ? "Auto DJ" : "Live DJ"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Radio className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No live broadcast</p>
          </div>
        )}

        {/* Official Radio.co widget */}
        <iframe
          src="https://embed.radio.co/player/65562fc.html"
          title="Mixxl Radio Player"
          className="w-full h-[150px] rounded-lg border-none"
          allow="autoplay"
        />

        {/* End Session Button */}
        {session?.isLive && user?.role === "DJ" && (
          <div className="flex justify-center">
            <Button
              variant="destructive"
              onClick={handleEndSession}
              disabled={ending}
            >
              {ending ? "Ending..." : "End Session"}
            </Button>
          </div>
        )}
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Powered by Radio.co</p>
          <p className="font-mono text-[10px] opacity-50">
            {RADIO_CO_STREAM_ID}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
