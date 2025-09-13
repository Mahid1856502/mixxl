// components/discover/ArtistsTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import UserCard from "@/components/social/user-card";
import { Artist } from "@shared/schema";
import { DiscoverFilters } from "@/api/hooks/artists/useArtists";

interface ArtistsTabProps {
  featuredArtists: Artist[];
  sort: string;
  isLoading: boolean;
  filters?: DiscoverFilters;
}

const sortArtists = (artists: any[], sortBy: string) => {
  return [...artists].sort((a, b) => {
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
        return a.username.localeCompare(b.username);
      default:
        return 0;
    }
  });
};

export default function ArtistsTab({
  featuredArtists,
  sort,
  isLoading = false,
  filters,
}: ArtistsTabProps) {
  const sortedArtists = sortArtists(featuredArtists, sort);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-bold">Featured Artists</h2>
        <p className="text-muted-foreground">{sortedArtists.length} artists</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-effect border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedArtists.length === 0 ? (
        <Card className="glass-effect border-white/10">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">
              No featured artists yet
            </h3>
            <p className="text-muted-foreground">
              Talented artists will be featured here as they join the platform
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArtists.map((artist) => (
            <UserCard
              key={artist.id}
              user={artist}
              variant="detailed"
              isFollowing={artist.isFollowing}
              filters={filters}
            />
          ))}
        </div>
      )}
    </div>
  );
}
