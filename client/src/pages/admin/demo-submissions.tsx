import React, { useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Music,
  Play,
  Pause,
  Check,
  X,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";
import {
  useDemoSubmissions,
  useUpdateDemoSubmissionStatus,
  type DemoSubmissionWithDetails,
} from "@/api/hooks/admin/useDemoSubmissions";
import { useAuth } from "@/provider/use-auth";

const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

function TrackPlayer({
  track,
  isPlaying,
  onPlayPause,
}: {
  track: DemoSubmissionWithDetails["tracks"][0];
  isPlaying: boolean;
  onPlayPause: (url: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0"
        onClick={() => onPlayPause(track.fileUrl)}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{track.title}</p>
      </div>
      <a
        href={track.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-primary shrink-0"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function DemoSubmissionsAdmin() {
  const { user } = useAuth();
  const { data: submissions = [], isLoading } = useDemoSubmissions();
  const updateStatus = useUpdateDemoSubmissionStatus();
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = (url: string) => {
    if (playingUrl === url) {
      audioRef.current?.pause();
      setPlayingUrl(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = audioRef.current;
    if (audio) {
      audio.src = url;
      audio.play();
      setPlayingUrl(url);
      audio.onended = () => setPlayingUrl(null);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <audio ref={audioRef} className="hidden" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-primary" />
              Demo Submissions
            </h1>
            <p className="text-gray-400 mt-1">
              Review artist demos submitted to Mixxl Media Records
            </p>
          </div>
          <Button asChild variant="outline" className="border-gray-700">
            <Link href="/admin">Back</Link>
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Submissions</CardTitle>
            <p className="text-sm text-gray-400">
              Listen to tracks, read artist info, and approve or reject
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-16 w-full rounded-lg bg-gray-800"
                  />
                ))}
              </div>
            ) : submissions.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {submissions.map((sub) => (
                  <AccordionItem
                    key={sub.id}
                    value={sub.id}
                    className="border-gray-800"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">
                            {sub.user?.fullName ||
                              sub.user?.username ||
                              "Unknown"}
                          </span>
                          <span className="text-gray-400 text-sm">
                            @{sub.user?.username}
                          </span>
                          <Badge
                            variant={
                              sub.status === "approved"
                                ? "default"
                                : sub.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {sub.status || "pending"}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(sub.createdAt)} • {sub.tracks.length}{" "}
                          track(s)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Mail className="w-4 h-4" />
                            {sub.user?.email}
                          </span>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/profile/${sub.user?.username}`}>
                              <User className="w-4 h-4 mr-1" />
                              View Profile
                            </Link>
                          </Button>
                        </div>

                        {sub.user?.socialMedia &&
                        typeof sub.user.socialMedia === "object" ? (
                            <div className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">
                                Socials:{" "}
                              </span>
                              {Object.entries(
                                sub.user.socialMedia as Record<string, string>,
                              )
                                .filter(([, v]) => v)
                                .map(([k, v]) => (
                                  <a
                                    key={k}
                                    href={
                                      String(v).startsWith("http")
                                        ? String(v)
                                        : `https://${k}.com/${v}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline ml-1"
                                  >
                                    {k}
                                  </a>
                                ))
                                .reduce<React.ReactNode[]>(
                                  (acc, el, i) =>
                                    acc.length ? [...acc, ", ", el] : [el],
                                  [],
                                )}
                            </div>
                          ) : null}

                        {sub.message && (
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium text-gray-300 mb-1">
                              Message
                            </p>
                            <p className="text-gray-400 text-sm whitespace-pre-wrap">
                              {sub.message}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-2">
                            Tracks
                          </p>
                          <div className="space-y-2">
                            {sub.tracks.map((track) => (
                              <TrackPlayer
                                key={track.id}
                                track={track}
                                isPlaying={playingUrl === track.fileUrl}
                                onPlayPause={handlePlayPause}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={
                              updateStatus.isPending ||
                              sub.status === "approved"
                            }
                            onClick={() =>
                              updateStatus.mutate({
                                id: sub.id,
                                status: "approved",
                              })
                            }
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              updateStatus.isPending ||
                              sub.status === "rejected"
                            }
                            onClick={() =>
                              updateStatus.mutate({
                                id: sub.id,
                                status: "rejected",
                              })
                            }
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600"
                            disabled={
                              updateStatus.isPending ||
                              sub.status === "contacted"
                            }
                            onClick={() =>
                              updateStatus.mutate({
                                id: sub.id,
                                status: "contacted",
                              })
                            }
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Mark Contacted
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-gray-400 text-center py-12">
                No demo submissions yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
