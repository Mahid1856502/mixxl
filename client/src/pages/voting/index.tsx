import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Vote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function VotingLandingPage() {
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ["/api/voting/competitions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/voting/competitions");
      if (!res.ok) throw new Error("Failed to fetch competitions");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mixxl Competitions
              </h1>
              <p className="text-gray-400 mt-1">
                Vote for your favourite artists and win amazing prizes
              </p>
            </div>
            <Button asChild variant="outline" className="border-purple-500 text-purple-400">
              <Link href="/">← Back to Mixxl</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {competitions.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-16 text-center">
              <Trophy className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No competitions yet
              </h2>
              <p className="text-gray-400">
                Check back soon for upcoming demo competitions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((c: any) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CompetitionCard({ competition }: { competition: any }) {
  const isClosed = competition.status === "closed";
  const isVotingLive = competition.status === "voting_live";
  const canParticipate = !isClosed;

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-purple-500/50 transition-colors">
      <Link href={`/voting/${competition.id}`}>
        <a className="block">
          <div className="aspect-video bg-gray-800 relative overflow-hidden">
            {competition.bannerImage ? (
              <img
                src={competition.bannerImage}
                alt={competition.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                <Trophy className="h-16 w-16 text-purple-500/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge
                variant="outline"
                className={
                  isVotingLive
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : "bg-green-500/20 text-green-400 border-green-500/50"
                }
              >
                {competition.status === "voting_live"
                  ? "Voting live"
                  : "Accepting demos"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-white text-lg mb-1">
              {competition.name}
            </h3>
            <p className="text-gray-400 text-sm flex items-center gap-1 mb-3">
              <MapPin className="h-3.5 w-3.5" />
              {competition.city}
            </p>
            <p className="text-gray-500 text-xs">
              {format(new Date(competition.startDate), "dd MMM yyyy")} –{" "}
              {format(new Date(competition.endDate), "dd MMM yyyy")}
            </p>
            {canParticipate && (
              <Button
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                asChild
              >
                <span>
                  <Vote className="h-4 w-4 mr-2" />
                  {isVotingLive ? "Vote now" : "View competition"}
                </span>
              </Button>
            )}
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}
