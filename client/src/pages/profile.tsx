import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackCard from "@/components/music/track-card";
import PlaylistCard from "@/components/music/playlist-card";
import UserCard from "@/components/social/user-card";
import TipModal from "@/components/modals/tip-modal";
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
  Crown,
  Verified,
  Settings,
  Edit,
  Play,
  TrendingUp,
  Euro,
} from "lucide-react";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { useUserPlaylists } from "@/api/hooks/playlist/usePlaylist";
import { useUserTracks } from "@/api/hooks/tracks/useMyTracks";
import { useUserById } from "@/api/hooks/users/useUserById";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const profileUserId = id || currentUser?.id;
  const isOwnProfile = profileUserId === currentUser?.id;

  const { data: user } = useUserById(profileUserId ?? "");

  const { data: userTracks = [] } = useUserTracks();

  const { data: userPlaylists = [] } = useUserPlaylists(profileUserId);
  console.log("userPlaylists", userPlaylists);

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
    enabled: !!profileUserId && !!currentUser && !isOwnProfile,
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/users/${profileUserId}/is-following`,
        {}
      );
      return response.json();
    },
  });

  const followMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/users/${profileUserId}/follow`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "is-following"],
      });
      toast({
        title: "Now following",
        description: `You are now following @${user?.username}`,
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () =>
      apiRequest("DELETE", `/api/users/${profileUserId}/follow`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profileUserId, "is-following"],
      });
      toast({
        title: "Unfollowed",
        description: `You unfollowed @${user?.username}`,
      });
    },
  });

  const handleFollow = () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to follow users",
        variant: "destructive",
      });
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  // Create conversation mutation for messaging
  const createConversationMutation = useMutation({
    mutationFn: async (participant2Id: string) => {
      const response = await apiRequest("POST", "/api/conversations", {
        participant2Id,
      });
      return response.json();
    },
    onSuccess: (conversation) => {
      setLocation(`/messages?conversation=${conversation.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const handleMessage = () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) return;

    createConversationMutation.mutate(user?.id);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profileUserId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Profile link copied!",
      description: "Share this link to let others discover this profile",
    });
  };

  const handlePlay = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalPlays = () => {
    return userTracks.reduce(
      (sum: number, track: any) => sum + (track.playCount || 0),
      0
    );
  };

  const getTotalLikes = () => {
    return userTracks.reduce(
      (sum: number, track: any) => sum + (track.likesCount || 0),
      0
    );
  };

  const handleTip = () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to tip artists",
        variant: "destructive",
      });
      return;
    }
    setShowTipModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Cover/Header Section */}
      <div className="relative h-64 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 overflow-hidden">
        {user?.backgroundImage ? (
          <img
            src={user?.backgroundImage}
            alt="Profile background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-amber-500/30" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Button variant="secondary" size="icon" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setLocation("/profile-settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Info */}
        <Card className="glass-effect border-white/10 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage
                  className="object-cover"
                  src={
                    user?.profileImage ? `${BASE_URL}${user?.profileImage}` : ""
                  }
                  alt={user?.username}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user?.firstName?.[0]?.toUpperCase() ||
                    user?.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">
                      {user?.firstName && user?.lastName
                        ? `${user?.firstName} ${user?.lastName}`
                        : user?.username}
                    </h1>
                    {user?.emailVerified && (
                      <Verified className="w-6 h-6 text-blue-500" />
                    )}
                    {user?.role === "admin" && (
                      <Crown className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg">
                    @{user?.username}
                  </p>

                  <div className="flex items-center space-x-4 mt-2">
                    <Badge
                      className={`capitalize ${
                        user?.role === "artist"
                          ? "bg-purple-500 hover:bg-purple-600"
                          : user?.role === "admin"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-pink-500 hover:bg-pink-600"
                      }`}
                    >
                      {user?.role}
                    </Badge>
                    {!isOwnProfile && currentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMessage}
                        disabled={createConversationMutation.isPending}
                        className="h-7 text-xs bg-gradient-to-r from-pink-500/10 to-orange-500/10 hover:from-pink-500/20 hover:to-orange-500/20 border-pink-500/30"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message{" "}
                        {user?.firstName ? user?.firstName : user?.username}
                      </Button>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <p className="text-muted-foreground leading-relaxed">
                    {user?.bio}
                  </p>
                )}

                {/* Location & Website */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {user?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user?.location}</span>
                    </div>
                  )}
                  {user?.website && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={user?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {user?.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{userTracks.length}</div>
                    <div className="text-muted-foreground">Tracks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {userPlaylists.length}
                    </div>
                    <div className="text-muted-foreground">Playlists</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{followers.length}</div>
                    <div className="text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{following.length}</div>
                    <div className="text-muted-foreground">Following</div>
                  </div>
                  {user?.role === "artist" && (
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {getTotalPlays().toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Total Plays</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleFollow}
                      disabled={
                        followMutation.isPending || unfollowMutation.isPending
                      }
                      className={isFollowing ? "" : "mixxl-gradient text-white"}
                      variant={isFollowing ? "outline" : "default"}
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
                    <Button variant="outline" onClick={handleMessage}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    {user?.role === "artist" && (
                      <Button variant="outline" onClick={handleTip}>
                        <Euro className="w-4 h-4 mr-2" />
                        Tip Artist
                      </Button>
                    )}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/profile-settings")}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="music" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="music" className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Music</span>
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Social</span>
            </TabsTrigger>
            {user?.role === "artist" && (
              <TabsTrigger
                value="analytics"
                className="flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="music" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {isOwnProfile
                  ? user?.role === "artist"
                    ? "Your Tracks"
                    : "Your Music Library"
                  : `${user?.username}'s ${
                      user?.role === "artist" ? "Tracks" : "Music Library"
                    }`}
              </h2>
              {userTracks.length > 0 && (
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play All
                </Button>
              )}
            </div>

            {userTracks.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isOwnProfile
                      ? user?.role === "artist"
                        ? "No tracks uploaded yet"
                        : "No music purchased yet"
                      : user?.role === "artist"
                      ? "No tracks available"
                      : "No music in library"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile
                      ? user?.role === "artist"
                        ? "Start sharing your music with the world"
                        : "Discover and purchase tracks from your favorite artists"
                      : user?.role === "artist"
                      ? "This user hasn't uploaded any tracks yet"
                      : "This user hasn't purchased any music yet"}
                  </p>
                  {isOwnProfile && user?.role === "artist" && (
                    <Link href="/upload">
                      <Button className="mixxl-gradient text-white">
                        Upload Your First Track
                      </Button>
                    </Link>
                  )}
                  {isOwnProfile && user?.role === "fan" && (
                    <Link href="/discover">
                      <Button className="mixxl-gradient text-white">
                        Discover Music
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userTracks.map((track: any) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    showArtist={user?.role === "fan"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {isOwnProfile
                  ? "Your Playlists"
                  : `${user?.username}'s Playlists`}
              </h2>
              {isOwnProfile && (
                <Button
                  className="mixxl-gradient text-white"
                  onClick={() => setModalOpen(true)}
                >
                  Create Playlist
                </Button>
              )}
            </div>

            {userPlaylists.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isOwnProfile
                      ? "No playlists created yet"
                      : "No public playlists"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile
                      ? "Create your first playlist to organize your favorite tracks"
                      : "This user hasn't created any public playlists yet"}
                  </p>
                  {isOwnProfile && (
                    <Button
                      className="mixxl-gradient text-white"
                      onClick={() => setModalOpen(true)}
                    >
                      Create Your First Playlist
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPlaylists.map((playlist: any) => (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Following */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Following ({following.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {isOwnProfile
                          ? "You're not following anyone yet"
                          : "Not following anyone yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {following.slice(0, 5).map((followedUser: any) => (
                        <UserCard
                          key={followedUser.id}
                          user={followedUser}
                          variant="compact"
                        />
                      ))}
                      {following.length > 5 && (
                        <Button variant="outline" className="w-full">
                          View All Following
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Followers */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Followers ({followers.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {followers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {isOwnProfile ? "No followers yet" : "No followers yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followers.slice(0, 5).map((follower: any) => (
                        <UserCard
                          key={follower.id}
                          user={follower}
                          variant="compact"
                        />
                      ))}
                      {followers.length > 5 && (
                        <Button variant="outline" className="w-full">
                          View All Followers
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.role === "artist" && (
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Plays
                        </p>
                        <p className="text-2xl font-bold">
                          {getTotalPlays().toLocaleString()}
                        </p>
                      </div>
                      <Play className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Likes
                        </p>
                        <p className="text-2xl font-bold">
                          {getTotalLikes().toLocaleString()}
                        </p>
                      </div>
                      <Heart className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Followers
                        </p>
                        <p className="text-2xl font-bold">{followers.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">£0.00</p>
                      </div>
                      <Euro className="w-8 h-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Tracks */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Top Performing Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  {userTracks.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Upload tracks to see performance analytics
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTracks
                        .sort(
                          (a: any, b: any) =>
                            (b.playCount || 0) - (a.playCount || 0)
                        )
                        .slice(0, 5)
                        .map((track: any, index: number) => (
                          <div
                            key={track.id}
                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-sm font-bold">
                              #{index + 1}
                            </div>
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white/70" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {track.title}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{track.playCount || 0} plays</span>
                                <span>{track.likesCount || 0} likes</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        artist={{
          id: user?.id,
          firstName: user?.firstName || user?.username,
          lastName: user?.lastName || "",
          profileImage: user?.profileImage,
        }}
      />
      <CreatePlaylistModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
