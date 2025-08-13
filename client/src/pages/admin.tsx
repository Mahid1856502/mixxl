import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  Crown,
  Users,
  Music,
  Radio,
  TrendingUp,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Globe,
  MessageSquare,
  DollarSign,
  Activity,
  Server,
  Play,
} from "lucide-react";
import { Link } from "wouter";

// Radio Submissions Manager Component
function RadioSubmissionsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: radioSubmissions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/radio-submissions"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/api/admin/radio-submissions",
        {}
      );
      return response.json();
    },
  });

  const approveSubmissionMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/radio-submissions/${trackId}/approve`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/radio-submissions"],
      });
      toast({
        title: "Track approved",
        description: "Track has been added to radio playlist queue",
      });
    },
  });

  const rejectSubmissionMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/radio-submissions/${trackId}/reject`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/radio-submissions"],
      });
      toast({
        title: "Track rejected",
        description: "Track submission has been rejected",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="admin-card">
        <CardContent className="py-12 text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg">Pending Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {
                  radioSubmissions.filter((s: any) => s.status === "pending")
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">
                waiting for review
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg">Approved This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {
                  radioSubmissions.filter((s: any) => s.status === "approved")
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">added to playlist</p>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {radioSubmissions.length}
              </div>
              <p className="text-sm text-muted-foreground">all time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Radio className="w-5 h-5" />
            <span>Radio Playlist Submissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radioSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground">
                Artists can submit tracks for radio playlist consideration when
                uploading music.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Track</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {radioSubmissions.map((submission: any) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                          <Music className="w-5 h-5 text-white/70" />
                        </div>
                        <div>
                          <p className="font-medium">{submission.title}</p>
                          {submission.duration && (
                            <p className="text-sm text-muted-foreground">
                              {Math.floor(submission.duration / 60)}:
                              {(submission.duration % 60)
                                .toString()
                                .padStart(2, "0")}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {submission.artistName?.charAt(0) || "A"}
                          </span>
                        </div>
                        <span>{submission.artistName || "Artist"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {submission.genre || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          submission.status === "pending"
                            ? "bg-amber-500"
                            : submission.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Preview functionality can be added later
                            toast({
                              title: "Preview",
                              description: "Audio preview feature coming soon",
                            });
                          }}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        {submission.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() =>
                                approveSubmissionMutation.mutate(submission.id)
                              }
                              disabled={approveSubmissionMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                rejectSubmissionMutation.mutate(submission.id)
                              }
                              disabled={rejectSubmissionMutation.isPending}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSiteConfigModal, setShowSiteConfigModal] = useState(false);

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    queryFn: async () => {
      // Mock data since API endpoint doesn't exist yet
      return {
        totalUsers: 1247,
        totalTracks: 3891,
        totalPlaylists: 567,
        activeRadioSessions: 2,
        totalPlays: 45623,
        revenue: 2150.5,
        storageUsed: 45.2, // GB
        bandwidthUsed: 120.5, // GB
      };
    },
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ["/api/admin/users/recent"],
    queryFn: async () => {
      // Mock data
      return [];
    },
  });

  const { data: siteConfig = [] } = useQuery({
    queryKey: ["/api/admin/site-config"],
  });

  const { data: systemHealth } = useQuery({
    queryKey: ["/api/admin/health"],
    refetchInterval: 30000,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/health", {});
      return response.json();
    },
  });

  const updateSiteConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest(
        "PUT",
        `/api/admin/site-config/${key}`,
        { value }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-config"] });
      toast({
        title: "Configuration updated",
        description: "Site configuration has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const resetSiteConfigMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/site-config/${key}/reset`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-config"] });
      toast({
        title: "Configuration reset",
        description: "Configuration has been reset to default",
      });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: systemStats?.totalUsers?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-500",
      change: "+15 this week",
    },
    {
      title: "Total Tracks",
      value: systemStats?.totalTracks?.toLocaleString() || "0",
      icon: Music,
      color: "text-purple-500",
      change: "+42 this week",
    },
    {
      title: "Active Radio",
      value: systemStats?.activeRadioSessions?.toString() || "0",
      icon: Radio,
      color: "text-red-500",
      change: "2 sessions live",
    },
    {
      title: "Revenue",
      value: `£${systemStats?.revenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-green-500",
      change: "+£120 today",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center space-x-3">
              <Crown className="w-10 h-10 text-orange-500" />
              <span className="mixxl-gradient-text">Admin Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your Mixxl platform and monitor system health
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-muted-foreground">
                {isConnected ? "System Online" : "System Offline"}
              </span>
            </div>
            <Badge variant="secondary" className="bg-orange-500 text-white">
              Administrator
            </Badge>
          </div>
        </div>

        {/* System Health Alert */}
        {!isConnected && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              System connectivity issues detected. Some features may be
              unavailable.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="admin-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="radio">Radio</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">File Storage</span>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">WebSocket</span>
                    <Badge
                      className={
                        isConnected
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {isConnected ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Radio Streaming</span>
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Maintenance
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5" />
                    <span>Resource Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Used</span>
                      <span>{systemStats?.storageUsed || 0} GB / 100 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${systemStats?.storageUsed || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bandwidth (Monthly)</span>
                      <span>
                        {systemStats?.bandwidthUsed || 0} GB / 1000 GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((systemStats?.bandwidthUsed || 0) / 1000) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">New user registration</p>
                      <p className="text-sm text-muted-foreground">
                        john_doe joined as an artist • 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Track uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        "Summer Nights" by Maya Chen • 15 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Radio className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Radio session started</p>
                      <p className="text-sm text-muted-foreground">
                        "Electronic Beats" by DJ Nova • 1 hour ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button className="mixxl-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No users to display</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              {user.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize ${
                                user.role === "artist"
                                  ? "bg-purple-500"
                                  : user.role === "admin"
                                  ? "bg-orange-500"
                                  : "bg-pink-500"
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <h2 className="text-2xl font-bold">Content Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Tracks</span>
                    <span className="font-bold">
                      {systemStats?.totalTracks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Playlists</span>
                    <span className="font-bold">
                      {systemStats?.totalPlaylists || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Reviews</span>
                    <span className="font-bold text-amber-500">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reported Content</span>
                    <span className="font-bold text-red-500">1</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Music className="w-4 h-4 mr-2" />
                    Review Pending Tracks
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Handle Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Moderate Comments
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Content Policies
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="radio" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Radio Playlist Submissions</h2>
              <Badge className="bg-green-500 text-white">
                <Radio className="w-3 h-3 mr-1" />
                Radio Management
              </Badge>
            </div>

            <RadioSubmissionsManager />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <h2 className="text-2xl font-bold">System Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Database Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Records</span>
                    <span className="font-bold">
                      {(systemStats?.totalUsers || 0) +
                        (systemStats?.totalTracks || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Backup</span>
                    <span className="text-sm">2 hours ago</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Run Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      98.5%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uptime (30 days)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>62%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: "62%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Site Configuration</h2>
              <Button
                className="mixxl-gradient text-white"
                onClick={() => setShowSiteConfigModal(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Configuration
              </Button>
            </div>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Current Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {siteConfig.map((config: any) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{config.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          Key: {config.key}
                        </p>
                        <p className="text-sm mt-1">
                          {config.value || config.defaultValue}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newValue = prompt(
                              "Enter new value:",
                              config.value || config.defaultValue
                            );
                            if (newValue !== null) {
                              updateSiteConfigMutation.mutate({
                                key: config.key,
                                value: newValue,
                              });
                            }
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            resetSiteConfigMutation.mutate(config.key)
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Discount Codes</h2>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Link href="/admin/discount-codes">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Codes
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Total Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">12</div>
                    <p className="text-sm text-muted-foreground">
                      created codes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Active Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">8</div>
                    <p className="text-sm text-muted-foreground">
                      currently active
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Total Uses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">47</div>
                    <p className="text-sm text-muted-foreground">
                      times redeemed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Free Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-500">23</div>
                    <p className="text-sm text-muted-foreground">
                      artists helped
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    asChild
                  >
                    <Link href="/admin/discount-codes">
                      <Plus className="w-6 h-6" />
                      <span>Create New Code</span>
                      <span className="text-xs text-muted-foreground">
                        Generate discount codes
                      </span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    asChild
                  >
                    <Link href="/admin/discount-codes">
                      <BarChart3 className="w-6 h-6" />
                      <span>View Usage Stats</span>
                      <span className="text-xs text-muted-foreground">
                        Track redemptions
                      </span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    asChild
                  >
                    <Link href="/admin/discount-codes">
                      <Settings className="w-6 h-6" />
                      <span>Manage Codes</span>
                      <span className="text-xs text-muted-foreground">
                        Edit and configure
                      </span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Recent Code Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create discount codes to help artists get free profiles and
                    offer special deals
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Link href="/admin/discount-codes">
                      Create Your First Code
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      +12%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      vs last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg">Content Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">+25%</div>
                    <p className="text-sm text-muted-foreground">total plays</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">+8%</div>
                    <p className="text-sm text-muted-foreground">this month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground mb-6">
                  Detailed analytics and reporting features will be available
                  soon
                </p>
                <Button variant="outline">View Full Analytics</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
