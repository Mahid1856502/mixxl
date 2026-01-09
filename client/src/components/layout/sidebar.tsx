import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/provider/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Upload,
  Music,
  Radio,
  Users,
  MessageCircle,
  TrendingUp,
  Heart,
  ListMusic,
  Settings,
  HelpCircle,
  Crown,
  Zap,
} from "lucide-react";
import { usePublicPlaylists } from "@/api/hooks/playlist/usePlaylist";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: playlists = [] } = usePublicPlaylists();
  const { data: collaborations = [] } = useQuery({
    queryKey: ["/api/collaborations/pending"],
    enabled: !!user,
  });

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["fan", "artist", "admin"],
    },
    {
      name: "Upload Music",
      href: "/upload",
      icon: Upload,
      roles: ["artist"],
      badge:
        user?.role === "artist" && !user.stripeSubscriptionId
          ? "Premium"
          : null,
    },
    {
      name: "My Music",
      href: `/profile/${user?.id}/tracks`,
      icon: Music,
      roles: ["artist"],
    },
    {
      name: "Discover",
      href: "/discover",
      icon: TrendingUp,
      roles: ["fan", "artist", "admin"],
    },
    {
      name: "Radio",
      href: "/radio",
      icon: Radio,
      roles: ["fan", "artist", "admin"],
    },
    {
      name: "Following",
      href: "/following",
      icon: Users,
      roles: ["fan", "artist"],
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
      roles: ["fan", "artist"],
      badge: "3",
    },
    {
      name: "Liked Tracks",
      href: "/liked",
      icon: Heart,
      roles: ["fan", "artist"],
    },
  ];

  const adminNavigation = [
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: Crown,
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Content Moderation",
      href: "/admin/content",
      icon: Zap,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
  ];

  const isActive = (href: string) => {
    return (
      location === href || (href !== "/dashboard" && location.startsWith(href))
    );
  };

  if (!user) return null;

  return (
    <div className="fixed flex flex-col h-full w-64 glass-effect border-r border-white/10">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg mixxl-gradient flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            if (!item.roles.includes(user.role)) return null;

            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 ${
                    isActive(item.href)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {user.role === "admin" && (
          <>
            <Separator className="my-6 bg-white/10" />
            <div className="space-y-2">
              <h3 className="px-3 text-sm font-medium text-muted-foreground">
                Administration
              </h3>
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={`w-full justify-start h-9 text-sm ${
                          isActive(item.href)
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Collaboration Requests */}
        {/* {collaborations.length > 0 && (
          <>
            <Separator className="my-6 bg-white/10" />
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Collaboration Requests
                </h3>
                <Badge variant="destructive" className="text-xs">
                  {collaborations.length}
                </Badge>
              </div>
              <Link href="/collaborations">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 text-sm hover:bg-white/5"
                >
                  <Users className="w-4 h-4 mr-3" />
                  View Requests
                </Button>
              </Link>
            </div>
          </>
        )} */}
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 space-y-2 border-t border-white/10">
        <Button variant="ghost" className="w-full justify-start h-9 text-sm">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start h-9 text-sm">
          <HelpCircle className="w-4 h-4 mr-3" />
          Help & Support
        </Button>
      </div>
    </div>
  );
}
