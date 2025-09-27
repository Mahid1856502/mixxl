import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import TrackCard from "@/components/music/track-card";
import PlaylistCard from "@/components/music/playlist-card";
import {
  Upload,
  Music,
  Radio,
  Users,
  Heart,
  TrendingUp,
  Crown,
  Zap,
  MessageCircle,
  Euro,
  Play,
} from "lucide-react";
import { useUserTracks } from "@/api/hooks/tracks/useMyTracks";
import { useState } from "react";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { useUserPlaylists } from "@/api/hooks/playlist/usePlaylist";
import { useQueryParams } from "@/hooks/use-query-params";

export default function Dashboard() {
  const [params, setParams] = useQueryParams({
    tab: "overview",
  });

  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Redirect admin users to admin dashboard
  if (user?.role === "admin") {
    window.location.href = "/admin";
    return null;
  }

  const { data: userTracks = [], isLoading: tracksLoading } = useUserTracks(
    params.tab === "music",
    user?.id
  );

  const { data: userPlaylists = [] } = useUserPlaylists({
    identifier: user?.id,
    enabled: params.tab === "playlists",
  });

  const { data: recentTracks = [], isLoading: recentLoading } = useQuery({
    queryKey: ["/api/tracks"],
  });

  const { data: followingArtists = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "following"],
    enabled: !!user,
  });

  // Type guards for better TypeScript support
  const tracks = Array.isArray(userTracks) ? userTracks : [];
  const playlists = Array.isArray(userPlaylists) ? userPlaylists : [];
  const recent = Array.isArray(recentTracks) ? recentTracks : [];
  const following = Array.isArray(followingArtists) ? followingArtists : [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Mixxl</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard
            </p>
            <Link href="/login">
              <Button className="mixxl-gradient text-white">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    {
      title: "Total Plays",
      value: tracks
        .reduce((sum: number, track: any) => sum + (track.playCount || 0), 0)
        .toLocaleString(),
      icon: Play,
      color: "text-blue-500",
    },
    {
      title: "Tracks",
      value: tracks.length.toString(),
      icon: Music,
      color: "text-purple-500",
    },
    {
      title: "Playlists",
      value: playlists.length.toString(),
      icon: Heart,
      color: "text-pink-500",
    },
    {
      title: "Followers",
      value: "0", // TODO: Get from followers API
      icon: Users,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user.firstName || user.username}!
            </h1>
            <p className="text-muted-foreground">
              {user.role === "artist"
                ? "Ready to share your music with the world?"
                : "Discover your next favorite track"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
            {user.emailVerified && (
              <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-effect border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Subscription Status for Artists */}
        {user.role === "artist" &&
          user.subscriptionStatus !== "lifetime_free" &&
          (!user.stripeSubscriptionId ||
            user.subscriptionStatus === "canceled") && (
            <Card className="glass-effect border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold">
                        Start Your 90-Day Free Trial
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Upload unlimited music, access advanced analytics, and
                      monetize your content
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Upload className="w-4 h-4 text-amber-500" />
                        <span>Unlimited uploads</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Euro className="w-4 h-4 text-amber-500" />
                        <span>Monetization</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      90 days free, then £10/mo. Cancel anytime.
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm text-muted-foreground">After trial</p>
                    <p className="text-2xl font-bold">£10/mo</p>
                    <Link href="/subscribe">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Main Content Tabs */}
        <Tabs
          defaultValue="overview"
          className="space-y-6"
          value={params.tab}
          onValueChange={(tab) => setParams({ tab })}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            {user.role === "artist" && (
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user.role === "artist" && (
                    <>
                      <Link href="/upload">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex flex-col space-y-2"
                        >
                          <Upload className="w-6 h-6" />
                          <span>Upload Track</span>
                        </Button>
                      </Link>
                      {/* <Link href="/live">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex flex-col space-y-2 hover:border-red-500/50"
                        >
                          <Video className="w-6 h-6 text-red-500" />
                          <span>Go Live</span>
                        </Button>
                      </Link> */}
                    </>
                  )}
                  <Link href="/discover">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col space-y-2"
                    >
                      <TrendingUp className="w-6 h-6" />
                      <span>Discover</span>
                    </Button>
                  </Link>
                  <Link href="/radio">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col space-y-2"
                    >
                      <Radio className="w-6 h-6" />
                      <span>Live Radio</span>
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col space-y-2"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span>Messages</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Recent Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  {recent.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No tracks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recent.slice(0, 3).map((track: any) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          showArtist={false}
                          variant="recent"
                          isLoading={recentLoading}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Music</h2>
              {user.role === "artist" && (
                <Link href="/upload">
                  <Button className="mixxl-gradient text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                </Link>
              )}
            </div>

            {tracks.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No tracks uploaded yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {user.role === "artist"
                      ? "Start sharing your music with the world"
                      : "Liked tracks will appear here"}
                  </p>
                  {user.role === "artist" && (
                    <Link href="/upload">
                      <Button className="mixxl-gradient text-white">
                        Upload Your First Track
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tracks.map((track: any) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    showArtist={false}
                    isLoading={tracksLoading}
                    variant="card"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Playlists</h2>
              <Button
                className="mixxl-gradient text-white"
                onClick={() => setModalOpen(true)}
              >
                Create Playlist
              </Button>
            </div>

            {playlists.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No playlists yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first playlist to organize your favorite tracks
                  </p>
                  <Button
                    className="mixxl-gradient text-white"
                    onClick={() => setModalOpen(true)}
                  >
                    Create Your First Playlist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist: any) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    showCreator={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <h2 className="text-2xl font-bold">Social</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Following Artists</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        No artists followed yet
                      </p>
                      <Link href="/discover">
                        <Button size="sm" variant="outline" className="mt-3">
                          Discover Artists
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {following.slice(0, 3).map((artist: any) => (
                        <div
                          key={artist.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <Music className="w-5 h-5 text-white/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {artist.firstName} {artist.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {artist.genre || "Independent Artist"}
                            </p>
                          </div>
                          <Link href={`/profile/${artist.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {following.length > 3 && (
                        <div className="text-center pt-2">
                          <Link href="/profile">
                            <Button size="sm" variant="ghost">
                              View all ({following.length})
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user.role === "artist" && (
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Plays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {tracks
                        .reduce(
                          (sum: number, track: any) =>
                            sum + (track.playCount || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Track</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tracks.length > 0 ? (
                      <div>
                        <p className="font-medium truncate">
                          {tracks[0]?.title || "No tracks"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tracks[0]?.playCount || 0} plays
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Upload tracks to see analytics
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      {modalOpen && (
        <CreatePlaylistModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </div>
  );
}
