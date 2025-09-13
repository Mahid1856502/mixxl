import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  UserPlus,
  UserCheck,
  MessageCircle,
  Music,
  Heart,
  Crown,
  Verified,
} from "lucide-react";
import { User } from "@shared/schema";
import { useFollowUser, useUnfollowUser } from "@/api/hooks/users/useSocials";
import { DiscoverFilters } from "@/api/hooks/artists/useArtists";

interface UserCardProps {
  user: User;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  filters?: DiscoverFilters;
}

export default function UserCard({
  user,
  isFollowing = false,
  showFollowButton = true,
  className = "",
  variant = "default",
  filters,
}: UserCardProps) {
  const { user: currentUser } = useAuth();

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const followMutation = useFollowUser(user.id, user.username, filters);
  const unfollowMutation = useUnfollowUser(user.id, user.username, filters);

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

    createConversationMutation.mutate(user.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "artist":
        return <Music className="w-3 h-3" />;
      case "admin":
        return <Crown className="w-3 h-3" />;
      default:
        return <Heart className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "artist":
        return "bg-purple-500 hover:bg-purple-600";
      case "admin":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-pink-500 hover:bg-pink-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${className}`}
      >
        <Link href={`/profile/${user.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage
              className="object-cover"
              src={user.profileImage ?? ""}
              alt={user.username}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.firstName?.[0]?.toUpperCase() ||
                user.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.id}`}>
            <p className="font-medium truncate hover:text-primary transition-colors">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
              {user.emailVerified && (
                <Verified className="w-4 h-4 inline ml-1 text-blue-500" />
              )}
            </p>
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>

        {currentUser && currentUser.id !== user.id && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMessage}
              className="h-8 text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Message
            </Button>
            {showFollowButton && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                disabled={
                  followMutation.isPending || unfollowMutation.isPending
                }
                className={isFollowing ? "" : "mixxl-gradient text-white"}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`track-card group ${className}`}>
      <CardContent className="p-0">
        {/* Background Image */}
        <div className="h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden rounded-t-lg">
          {user.backgroundImage ? (
            <img
              src={user.backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
          )}

          {/* Role Badge */}
          <div className="absolute top-2 right-2">
            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="ml-1 capitalize">{user.role}</span>
            </Badge>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-12 w-12 -mt-8 border-2 border-background">
                <AvatarImage
                  className="object-cover"
                  src={user.profileImage ?? ""}
                  alt={user.username}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.firstName?.[0]?.toUpperCase() ||
                    user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0 pt-1">
              <Link href={`/profile/${user.id}`}>
                <h3 className="font-semibold truncate hover:text-primary transition-colors flex items-center">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                  {user.emailVerified && (
                    <Verified className="w-4 h-4 ml-1 text-blue-500" />
                  )}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && variant === "detailed" && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Join Date */}
          <p className="text-xs text-muted-foreground">
            Joined{" "}
            {user.createdAt
              ? new Date(user.createdAt)?.toLocaleDateString()
              : ""}
          </p>

          {/* Actions */}
          {currentUser && currentUser.id !== user.id && (
            <div className="flex items-center space-x-2 pt-2">
              {showFollowButton && (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  disabled={
                    followMutation.isPending || unfollowMutation.isPending
                  }
                  className={`flex-1 ${
                    isFollowing ? "" : "mixxl-gradient text-white"
                  }`}
                >
                  {isFollowing ? (
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
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handleMessage}
                className="px-3"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
