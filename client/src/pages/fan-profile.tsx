import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import TrackCard from "@/components/music/track-card";
import UserCard from "@/components/social/user-card";
import PurchaseTrackModal from "@/components/modals/purchase-track-modal";
import CreateMixxlistModal from "@/components/modals/create-mixxlist-modal";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  UserCheck,
  MessageCircle,
  Share,
  MoreHorizontal,
  Music,
  Heart,
  Users,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Settings,
  Edit,
  Play,
  Clock,
  TrendingUp,
  Euro,
  Plus,
  ShoppingCart,
  Headphones,
  Star,
  List,
} from "lucide-react";

interface Mixxlist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  isPublic: boolean;
  coverImage?: string;
  createdAt: string;
  tracks?: any[];
}

export default function FanProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCreateMixxlist, setShowCreateMixxlist] = useState(false);
  const [selectedTrackForPurchase, setSelectedTrackForPurchase] =
    useState<any>(null);

  const profileUserId = id || currentUser?.id;
  const isOwnProfile = profileUserId === currentUser?.id;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", profileUserId],
    enabled: !!profileUserId,
  }) as { data: any; isLoading: boolean };

  const { data: userMixxlists = [] } = useQuery({
    queryKey: ["/api/users", profileUserId, "mixxlists"],
    enabled: !!profileUserId,
  }) as { data: Mixxlist[] };

  const { data: purchasedTracks = [] } = useQuery({
    queryKey: ["/api/users", profileUserId, "purchased-tracks"],
    enabled: !!profileUserId && isOwnProfile,
  }) as { data: any[] };

  const { data: favoriteArtists = [] } = useQuery({
    queryKey: ["/api/users", profileUserId, "favorite-artists"],
    enabled: !!profileUserId,
  }) as { data: any[] };

  const { data: followers = [] } = useQuery({
    queryKey: ["/api/users", profileUserId, "followers"],
    enabled: !!profileUserId,
  }) as { data: any[] };

  const { data: following = [] } = useQuery({
    queryKey: ["/api/users", profileUserId, "following"],
    enabled: !!profileUserId,
  }) as { data: any[] };

  const { data: isFollowing } = useQuery({
    queryKey: ["/api/users", profileUserId, "is-following"],
    enabled: !!currentUser && !isOwnProfile,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const action = isFollowing ? "unfollow" : "follow";
      return await apiRequest("POST", `/api/users/${profileUserId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "is-following"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "followers"],
      });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing
          ? `You unfollowed ${user?.username}`
          : `You're now following ${user?.username}`,
      });
    },
  });

  const startMessage = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }
    setLocation(`/messages?user=${user.id}`);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Card className="bg-dark-secondary/80 border-gray-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Fan not found
            </h2>
            <p className="text-gray-300 mb-6">
              The fan profile you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  className="object-cover"
                  src={
                    user.profileImage ? `${BASE_URL}${user.profileImage}` : ""
                  }
                  alt={user.username}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                  {user.username?.[0]?.toUpperCase() || "F"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {user.username}
                      </h1>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        <Heart className="w-3 h-3 mr-1" />
                        Fan
                      </Badge>
                    </div>
                    {user.bio && (
                      <p className="text-gray-300 text-lg">{user.bio}</p>
                    )}
                    {user.location && (
                      <div className="flex items-center text-gray-400 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!isOwnProfile && currentUser && (
                      <>
                        <Button
                          onClick={() => followMutation.mutate()}
                          disabled={followMutation.isPending}
                          className={
                            isFollowing
                              ? "bg-gray-600 hover:bg-gray-700"
                              : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                          }
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={startMessage}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                    {isOwnProfile && (
                      <Link href="/settings">
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userMixxlists.length}
                    </div>
                    <div className="text-gray-400">Mixxlists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {purchasedTracks.length}
                    </div>
                    <div className="text-gray-400">Purchased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {followers.length}
                    </div>
                    <div className="text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {following.length}
                    </div>
                    <div className="text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="mixxlists" className="space-y-6">
          <TabsList className="bg-dark-secondary/80 border-gray-700">
            <TabsTrigger
              value="mixxlists"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
            >
              <List className="w-4 h-4 mr-2" />
              Mixxlists ({userMixxlists.length})
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger
                value="purchased"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchased ({purchasedTracks.length})
              </TabsTrigger>
            )}
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Favorite Artists ({favoriteArtists.length})
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
            >
              <Users className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Mixxlists Tab */}
          <TabsContent value="mixxlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Mixxlists</h2>
              {isOwnProfile && (
                <Button
                  onClick={() => setShowCreateMixxlist(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Mixxlist
                </Button>
              )}
            </div>

            {userMixxlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userMixxlists.map((mixxlist) => (
                  <Card
                    key={mixxlist.id}
                    className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-200 group cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
                        {mixxlist.coverImage ? (
                          <img
                            src={mixxlist.coverImage}
                            alt={mixxlist.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Music className="w-16 h-16 text-pink-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 truncate">
                        {mixxlist.name}
                      </h3>
                      {mixxlist.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {mixxlist.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{mixxlist.trackCount} tracks</span>
                        <Badge
                          variant={mixxlist.isPublic ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mixxlist.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isOwnProfile
                      ? "No Mixxlists yet"
                      : `${user.username} hasn't created any Mixxlists`}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {isOwnProfile
                      ? "Create your first Mixxlist to organize your favorite tracks from purchased music."
                      : "Check back later to see their music collections."}
                  </p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setShowCreateMixxlist(true)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Mixxlist
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchased Tracks Tab (Own Profile Only) */}
          {isOwnProfile && (
            <TabsContent value="purchased" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Purchased Tracks
                </h2>
                <Link href="/discover">
                  <Button variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Discover Music
                  </Button>
                </Link>
              </div>

              {purchasedTracks.length > 0 ? (
                <div className="space-y-4">
                  {purchasedTracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No purchased tracks yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Start supporting independent artists by purchasing their
                      tracks. Your purchases will appear here.
                    </p>
                    <Link href="/discover">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Discover Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Favorite Artists Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Favorite Artists
              </h2>
              <Link href="/discover">
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Discover Artists
                </Button>
              </Link>
            </div>

            {favoriteArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteArtists.map((artist) => (
                  <UserCard
                    key={artist.id}
                    user={artist}
                    showFollowButton={!isOwnProfile}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isOwnProfile
                      ? "No favorite artists yet"
                      : `${user.username} hasn't favorited any artists`}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {isOwnProfile
                      ? "Start following your favorite independent artists to see them here."
                      : "Check back later to see their favorite artists."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/discover">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                        <Star className="w-4 h-4 mr-2" />
                        Discover Artists
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Followers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Followers ({followers.length})
                  </h3>
                </div>
                {followers.length > 0 ? (
                  <div className="space-y-4">
                    {followers.slice(0, 5).map((follower) => (
                      <UserCard
                        key={follower.id}
                        user={follower}
                        showFollowButton={false}
                      />
                    ))}
                    {followers.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Followers
                      </Button>
                    )}
                  </div>
                ) : (
                  <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No followers yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Following */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Following ({following.length})
                  </h3>
                </div>
                {following.length > 0 ? (
                  <div className="space-y-4">
                    {following.slice(0, 5).map((followedUser) => (
                      <UserCard
                        key={followedUser.id}
                        user={followedUser}
                        showFollowButton={false}
                      />
                    ))}
                    {following.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Following
                      </Button>
                    )}
                  </div>
                ) : (
                  <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">
                        {isOwnProfile
                          ? "You're not following anyone yet"
                          : `${user.username} isn't following anyone yet`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Mixxlist Modal */}
      <CreateMixxlistModal
        open={showCreateMixxlist}
        onOpenChange={setShowCreateMixxlist}
      />

      {/* Purchase Track Modal */}
      <PurchaseTrackModal
        open={!!selectedTrackForPurchase}
        onOpenChange={(open) => !open && setSelectedTrackForPurchase(null)}
        track={selectedTrackForPurchase}
      />
    </div>
  );
}
