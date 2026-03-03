import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MapPin,
  Vote,
  ThumbsUp,
  ArrowLeft,
  User,
  Music,
  Mic2,
} from "lucide-react";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { useAuth } from "@/provider/use-auth";
import { FanSignupModal } from "@/components/voting/FanSignupModal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return url;
  }
  return url;
}

export default function VotingCompetitionDetail() {
  const [, params] = useRoute("/voting/:id");
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/voting/competitions", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/voting/competitions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch competition");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: myVotes = { entryIds: [] } } = useQuery({
    queryKey: ["/api/voting/competitions", id, "my-votes"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/voting/competitions/${id}/my-votes`
      );
      if (!res.ok) return { entryIds: [] };
      return res.json();
    },
    enabled: !!id && !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const res = await apiRequest("POST", "/api/voting/vote", {
        competitionId: id,
        entryId,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/voting/competitions", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/voting/competitions", id, "my-votes"],
      });
      toast({ title: "Vote cast successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Could not vote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVoteClick = (entryId: string) => {
    if (!user) {
      setSignupModalOpen(true);
      return;
    }
    if (user.role !== "fan") {
      toast({
        title: "Fans only",
        description: "Sign up as a fan to vote in competitions.",
        variant: "destructive",
      });
      setSignupModalOpen(true);
      return;
    }
    if (myVotes.entryIds?.includes(entryId)) {
      toast({
        title: "Already voted",
        description: "You have already voted for this entry.",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(entryId);
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const competition = data;
  const entries = competition.entries || [];
  const voteCounts = competition.voteCounts || {};
  const showVoteCount = competition.showVoteCount !== false;
  const isVotingLive = competition.status === "voting_live";
  const isAcceptingDemos = competition.status === "accepting_demos";

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button
            asChild
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4"
          >
            <Link href="/voting">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to competitions
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {competition.name}
              </h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {competition.city}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {format(new Date(competition.startDate), "dd MMM yyyy")} –{" "}
                {format(new Date(competition.endDate), "dd MMM yyyy")}
              </p>
            </div>
            {competition.bannerImage && (
              <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={
                    competition.bannerImage.startsWith("http")
                      ? competition.bannerImage
                      : `${BASE_URL}${competition.bannerImage}`
                  }
                  alt={competition.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {competition.prizeDescription && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Prizes
              </h3>
              <pre className="text-gray-400 text-sm whitespace-pre-wrap font-sans">
                {competition.prizeDescription}
              </pre>
            </CardContent>
          </Card>
        )}

        {isAcceptingDemos && (
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <Mic2 className="h-5 w-5 text-green-400" />
                    Artists: Submit your demo
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Enter this competition by submitting your demo to Mixxl Media
                    Records.
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 shrink-0"
                >
                  <Link href="/onboarding">
                    <Music className="h-4 w-4 mr-2" />
                    Participate
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-16 text-center">
              <Music className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No finalists yet
              </h2>
              <p className="text-gray-400">
                Finalist entries will appear here when voting opens.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry: any) => (
              <FinalistCard
                key={entry.id}
                entry={entry}
                voteCount={showVoteCount ? voteCounts[entry.id] : undefined}
                hasVoted={myVotes.entryIds?.includes(entry.id)}
                isVotingLive={isVotingLive}
                onVote={() => handleVoteClick(entry.id)}
                isVoting={voteMutation.isPending}
              />
            ))}
          </div>
        )}
      </main>

      <FanSignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSuccess={() => queryClient.invalidateQueries()}
      />
    </div>
  );
}

function FinalistCard({
  entry,
  voteCount,
  hasVoted,
  isVotingLive,
  onVote,
  isVoting,
}: {
  entry: any;
  voteCount?: number;
  hasVoted: boolean;
  isVotingLive: boolean;
  onVote: () => void;
  isVoting: boolean;
}) {
  const embedUrl = getEmbedUrl(entry.videoUrl);

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <div className="aspect-video bg-gray-800">
        {embedUrl ? (
          embedUrl.includes("youtube") || embedUrl.includes("vimeo") ? (
            <iframe
              src={embedUrl}
              title={entry.songTitle}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={embedUrl}
              controls
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <a
              href={entry.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Watch video
            </a>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-white text-lg">{entry.songTitle}</h3>
        <p className="text-gray-400 flex items-center gap-1 mt-1">
          <User className="h-3.5 w-3.5" />
          {entry.artist?.fullName || entry.artist?.username || "Unknown"}
        </p>
        {entry.artistCity && (
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {entry.artistCity}
          </p>
        )}
        {entry.shortDescription && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {entry.shortDescription}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          {voteCount !== undefined && (
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {voteCount} votes
            </Badge>
          )}
          {isVotingLive && (
            <Button
              size="sm"
              className={
                hasVoted
                  ? "bg-green-600/20 text-green-400 border border-green-500/50"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              }
              disabled={hasVoted || isVoting}
              onClick={onVote}
            >
              {hasVoted ? (
                <>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Voted
                </>
              ) : (
                <>
                  <Vote className="h-4 w-4 mr-1" />
                  Vote
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
