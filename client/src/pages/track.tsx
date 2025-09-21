import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Play,
  Pause,
  Heart,
  Share,
  Music,
  Coins,
  Crown,
  Clock,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";

export default function TrackPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: track, isLoading } = useQuery({
    queryKey: ["/api/tracks", id],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Track not found");
        }
        throw new Error("Failed to load track");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: track?.title,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from liked songs" : "Added to liked songs",
      description: track?.title,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Track link has been copied to clipboard",
    });
  };

  const handleTip = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to tip artists",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Tip feature coming soon!",
      description: "Artist tipping will be available soon",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-32"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="aspect-square bg-white/10 rounded-lg"></div>
              </div>
              <div className="lg:w-2/3 space-y-4">
                <div className="h-8 bg-white/10 rounded w-3/4"></div>
                <div className="h-6 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h1 className="text-2xl font-bold mb-2">Track not found</h1>
          <p className="text-muted-foreground mb-6">
            The track you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/discover">
            <Button className="mixxl-gradient text-white">
              <Music className="w-4 h-4 mr-2" />
              Discover Music
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/discover">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </Link>

        {/* Track Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Album Art */}
          <div className="lg:w-1/3">
            <Card className="glass-effect border-white/10">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden rounded-lg">
                  {track.coverImage ? (
                    <img
                      src={track.coverImage}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-24 h-24 text-white/50" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="rounded-full w-16 h-16 mixxl-gradient text-white"
                      onClick={handlePlay}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8" />
                      )}
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {track.isExplicit && (
                      <Badge variant="destructive">Explicit</Badge>
                    )}
                    {track.price && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        £{track.price}
                      </Badge>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-4 right-4">
                    <Badge
                      variant="secondary"
                      className="bg-black/50 text-white"
                    >
                      {formatDuration(track.duration)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Track Info */}
          <div className="lg:w-2/3">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">
                      {track.title}
                    </CardTitle>
                    <Link href={`/profile/${track.artistId}`}>
                      <p className="text-xl text-muted-foreground hover:text-foreground transition-colors">
                        by {(track as any).artistName || "Unknown Artist"}
                      </p>
                    </Link>
                  </div>

                  {track.genre && (
                    <div>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {track.genre}
                      </Badge>
                    </div>
                  )}

                  {track.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {track.description}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>{(track.playCount || 0).toLocaleString()} plays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>
                      {(track.likesCount || 0).toLocaleString()} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Released {formatDate(track.createdAt)}</span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handlePlay}
                    className="mixxl-gradient text-white"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className={isLiked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {isLiked ? "Liked" : "Like"}
                  </Button>

                  <Button variant="outline" onClick={handleShare}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {user && user.id !== track.artistId && (
                    <Button variant="outline" onClick={handleTip}>
                      <Coins className="w-4 h-4 mr-2" />
                      Tip Artist
                    </Button>
                  )}

                  {track.hasPreviewOnly &&
                    track.price &&
                    user &&
                    user.id !== track.artistId && (
                      <Button className="mixxl-gradient text-white">
                        <Crown className="w-4 h-4 mr-2" />
                        Purchase £{track.price}
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
