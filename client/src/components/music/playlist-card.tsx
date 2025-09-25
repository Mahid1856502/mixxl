import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Music,
  Share,
  MoreHorizontal,
  Lock,
  Users,
  Clock,
} from "lucide-react";
import { Playlist } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: (playlist: Playlist) => void;
  className?: string;
  showCreator?: boolean;
}

export default function PlaylistCard({
  playlist,
  onPlay,
  className = "",
  showCreator = true,
}: PlaylistCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePlay = () => {
    if (onPlay) {
      onPlay(playlist);
    } else {
      // If no onPlay handler, navigate to playlist page
      setLocation(`/playlist/${playlist.id}`);
    }
  };

  const handleCardClick = () => {
    setLocation(`/playlist/${playlist.id}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/playlist/${playlist.id}`
    );
    toast({
      title: "Link copied!",
      description: "Playlist link has been copied to clipboard",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card
      className={`track-card group cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden rounded-t-lg">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
              <div className="text-center">
                <Music className="w-16 h-16 text-white/70 mx-auto mb-2" />
                <div className="text-xs text-white/50">
                  {playlist.trackCount} tracks
                </div>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="icon"
              className="rounded-full w-12 h-12 mixxl-gradient text-white"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>

          {/* Privacy Badge */}
          <div className="absolute top-2 left-2">
            {!playlist.isPublic && (
              <Badge
                variant="secondary"
                className="text-xs bg-black/50 text-white"
              >
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
            {/* {playlist.isCollaborative && (
              <Badge className="text-xs bg-blue-500 hover:bg-blue-600 mt-1">
                <Users className="w-3 h-3 mr-1" />
                Collaborative
              </Badge>
            )} */}
          </div>

          {/* Track Count */}
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="text-xs bg-black/50 text-white"
            >
              {playlist.trackCount} tracks
            </Badge>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="p-4 space-y-3">
          <div>
            <Link href={`/playlist/${playlist.id}`}>
              <h3 className="font-semibold mb-1 truncate hover:text-primary transition-colors">
                {playlist.name}
              </h3>
            </Link>

            {showCreator && (
              <Link href={`/profile/${playlist.creatorId}`}>
                <p className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                  Creator Name
                </p>
              </Link>
            )}
          </div>

          {/* Description */}
          {playlist.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Music className="w-3 h-3" />
                <span>{playlist.trackCount} tracks</span>
              </div>
              {/* {playlist.totalDuration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(playlist.totalDuration)}</span>
                </div>
              )} */}
            </div>
            {playlist.createdAt && (
              <span>
                {formatDate(new Date(playlist.createdAt).toISOString())}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-8 w-8 text-muted-foreground"
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlay}
                className="h-8 px-3 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Play All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
