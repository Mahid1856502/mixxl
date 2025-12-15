import { Artist } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowUser, useUnfollowUser } from "@/api/hooks/users/useSocials";
import { useAuth } from "@/provider/use-auth";
import { toast } from "@/hooks/use-toast";
import { DiscoverFilters } from "@/api/hooks/artists/useArtists";

interface RisingArtistsProps {
  artists: Artist[];
  filters: DiscoverFilters;
}

export default function RisingArtists({
  artists,
  filters,
}: RisingArtistsProps) {
  const { user: currentUser } = useAuth();
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Rising Artists</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {artists.slice(0, 5).map((artist, index) => {
            const followMutation = useFollowUser(
              artist.id,
              artist.username,
              filters
            );
            const unfollowMutation = useUnfollowUser(
              artist.id,
              artist.username,
              filters
            );

            const handleFollow = () => {
              if (!currentUser) {
                toast({
                  title: "Please sign in",
                  description: "You need to be signed in to follow users",
                  variant: "destructive",
                });
                return;
              }

              if (artist.isFollowing) {
                unfollowMutation.mutate();
              } else {
                followMutation.mutate();
              }
            };

            return (
              <div
                key={artist.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold">
                  #{index + 1}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    className="object-cover"
                    src={artist.profileImage ?? ""}
                    alt={artist.username}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {artist.fullName?.[0]?.toUpperCase() ||
                      artist.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {artist.fullName ? artist.fullName : artist.username}
                  </p>
                  <p className="text-sm text-muted-foreground">{artist.bio}</p>
                </div>
                <Button
                  size="sm"
                  variant={artist.isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  disabled={
                    followMutation.isPending || unfollowMutation.isPending
                  }
                  className={
                    artist.isFollowing ? "" : "mixxl-gradient text-white"
                  }
                >
                  {artist.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
