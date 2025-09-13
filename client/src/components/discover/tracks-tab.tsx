// components/discover/tracks-tab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrackCard from "@/components/music/track-card";
import { Music, Shuffle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";
import { TrackExtended } from "@shared/schema";

interface TracksTabProps {
  searchQuery: string;
  tracks: TrackExtended[];
  tracksLoading: boolean;
  sort: string;
  genre: string;
  mood: string;
}

const sortTracks = (tracks: TrackExtended[], sortBy: string) => {
  return [...tracks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

export default function TracksTab({
  searchQuery,
  tracks,
  tracksLoading,
  sort,
  genre,
  mood,
}: TracksTabProps) {
  const { user } = useAuth();

  const filteredTracks = tracks.filter((track) => {
    // Check genre
    if (genre !== "all" && track.genre !== genre) {
      return false;
    }

    // Check mood
    if (mood !== "all" && track.mood !== mood) {
      return false;
    }

    return true;
  });

  const sortedTracks = sortTracks(filteredTracks, sort);

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : "All Tracks"}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{sortedTracks.length} tracks found</span>
          <Button variant="ghost" size="sm">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Play
          </Button>
        </div>
      </div>

      {/* Tracks Grid */}
      {tracksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="h-40 w-full rounded-md mb-2" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded mt-1" />
            </Card>
          ))}
        </div>
      ) : sortedTracks.length === 0 ? (
        <Card className="glass-effect border-white/10">
          <CardContent className="py-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Be the first to upload a track!"}
            </p>
            {!searchQuery && user?.role === "artist" && (
              <Button className="mixxl-gradient text-white">
                Upload First Track
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Preview Mode Tracks Section */}
          {sortedTracks.some((track) => track.hasPreviewOnly) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-500" />
                  Preview Tracks
                </h3>
                <Badge variant="outline" className="text-xs">
                  Purchase to unlock full versions
                </Badge>
              </div>
              <div className="space-y-3">
                {sortedTracks
                  .filter((track) => track.hasPreviewOnly)
                  .map((track) => (
                    <TrackCard
                      key={`preview-${track.id}`}
                      track={track}
                      variant="preview"
                      className="mb-3"
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Regular Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTracks
              .filter((track) => !track.hasPreviewOnly)
              .map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  variant="card"
                  isLoading={tracksLoading}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
