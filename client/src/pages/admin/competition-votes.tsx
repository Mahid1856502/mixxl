import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Download, ArrowLeft, ThumbsUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function CompetitionVotesAdmin() {
  const [, params] = useRoute("/admin/competitions/:id/votes");
  const id = params?.id;

  const { data: competition, isLoading } = useQuery({
    queryKey: ["/api/admin/competitions", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/competitions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/admin/competitions", id, "leaderboard"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admin/competitions/${id}/leaderboard`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
  });

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    const baseUrl =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_LOCAL_BASE_URL
        : import.meta.env.VITE_PROD_BASE_URL;
    const res = await fetch(
      `${baseUrl}/api/admin/competitions/${id}/votes/export`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `votes-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !competition) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white mb-2"
              >
                <Link href="/admin/competitions">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to competitions
                </Link>
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Votes: {competition.name}
              </h1>
              <p className="text-gray-400">{competition.city}</p>
            </div>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ThumbsUp className="h-5 w-5 text-purple-400" />
              Leaderboard
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Total votes per entry, ranked by vote count
            </p>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-800 rounded-lg"
                  />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-gray-400 text-center py-12">
                No votes yet
              </p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry: any, idx: number) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-500 w-8">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">
                          {entry.songTitle}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {entry.artist?.fullName || entry.artist?.username} •{" "}
                          {entry.artistCity || "—"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/50">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {entry.voteCount} votes
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
