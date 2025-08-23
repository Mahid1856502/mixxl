import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  User,
  Heart,
  MessageCircle,
  Radio,
  Gift,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/api/hooks/notifications/useNotifications";

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "follow":
      return <User className="w-4 h-4 text-blue-500" />;
    case "message":
      return <MessageCircle className="w-4 h-4 text-green-500" />;
    case "tip":
      return <Gift className="w-4 h-4 text-yellow-500" />;
    case "live_stream":
      return <Radio className="w-4 h-4 text-red-500" />;
    case "track_like":
      return <Heart className="w-4 h-4 text-pink-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export default function NotificationsPage() {
  const [, setLocation] = useLocation();

  const { data: notifications = [], isLoading: notificationsLoading } =
    useNotifications();
  const { data: unreadData, isLoading: unreadLoading } =
    useUnreadNotificationCount();

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest(
        "PATCH",
        `/api/notifications/${notificationId}/read`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread-count"],
      });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "PATCH",
        "/api/notifications/mark-all-read"
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread-count"],
      });
    },
  });

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to the action URL if provided
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  if (notificationsLoading || unreadLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadData && unreadData.count > 0 && (
                <p className="text-muted-foreground">
                  You have {unreadData.count} unread notification
                  {unreadData.count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {unreadData && unreadData.count > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground text-center">
                When someone follows you, sends a message, or interacts with
                your content, you'll see notifications here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.isRead
                      ? "border-primary/20 bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {notification.actor?.profileImage ? (
                          <img
                            src={notification.actor.profileImage}
                            alt={notification.actor.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {notification.actor?.firstName?.[0] ||
                                notification.actor?.username?.[0] ||
                                "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <NotificationIcon type={notification.type} />
                              <span className="font-semibold text-sm">
                                {notification.title}
                              </span>
                              {!notification.isRead && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 text-xs"
                                >
                                  New
                                </Badge>
                              )}
                              {notification.actor?.emailVerified && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 text-xs bg-blue-500/10 text-blue-600"
                                >
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(notification.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate(notification.id);
                                  }}
                                  disabled={markAsReadMutation.isPending}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
