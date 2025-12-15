// components/discover/albums-tab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrackCard from "@/components/music/track-card";
import { Music, Shuffle, Lock, Unlock } from "lucide-react";
import { useAuth } from "@/provider/use-auth";
import { Skeleton } from "../ui/skeleton";
import { Album } from "@shared/schema";

interface AlbumsTabProps {
  searchQuery: string;
  albums: Album[];
  albumsLoading: boolean;
  sort: string;
}

const sortAlbums = (albums: Album[], sortBy: string) => {
  return [...albums].sort((a, b) => {
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

export default function AlbumsTab({
  searchQuery,
  albums,
  albumsLoading,
  sort,
}: AlbumsTabProps) {
  const { user } = useAuth();

  const sortedAlbums = sortAlbums(albums, sort);

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : "All Albums"}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{sortedAlbums.length} albums found</span>
          <Button variant="ghost" size="sm">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Play
          </Button>
        </div>
      </div>

      {/* Albums Grid */}
      {albumsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="h-40 w-full rounded-md mb-2" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded mt-1" />
            </Card>
          ))}
        </div>
      ) : sortedAlbums.length === 0 ? (
        <Card className="glass-effect border-white/10">
          <CardContent className="py-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No albums found</h3>
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
          {
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-500" />
                  Preview Albums
                </h3>
                <Badge variant="outline" className="text-xs">
                  Purchase to unlock full versions
                </Badge>
              </div>
              <div className="space-y-3">
                {sortedAlbums
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
          }
        </>
      )}
    </div>
  );
}
