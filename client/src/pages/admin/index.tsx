import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Star, Mail, TrendingUp, Crown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">
                Manage Mixxl platform content and users
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/broadcasts/new">Create Broadcast</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin/featured-spots/new">
                  Add Featured Artist
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.users?.total || 0}
              </div>
              <p className="text-xs text-gray-400">
                {stats?.users?.artists || 0} artists, {stats?.users?.fans || 0}{" "}
                fans
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Subscribed Users
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.users?.subscribed || 0}
              </div>
              <p className="text-xs text-gray-400">Active subscribers</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Featured Spots
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.featuredSpots?.active || 0}
              </div>
              <p className="text-xs text-gray-400">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Broadcasts
              </CardTitle>
              <Mail className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.broadcasts?.total || 0}
              </div>
              <p className="text-xs text-gray-400">Total sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Artists */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="h-5 w-5 text-yellow-400" />
                Featured Artists
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage carousel featured artist spots and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/featured-spots">Manage Featured Spots</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin/featured-spots/new">
                  Add New Featured Artist
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* User Communications */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-blue-400" />
                User Communications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send targeted messages and notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/broadcasts">Manage Broadcasts</Link>
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                User Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and manage user accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Discount Codes */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 text-amber-400" />
                Discount Codes
              </CardTitle>
              <CardDescription className="text-gray-400">
                Create codes for free artist profiles and discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/discount-codes">Manage Codes</Link>
              </Button>
            </CardContent>
          </Card>

          {/* ✅ Advertising Banners - NEW */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-red-400" />
                Advertising Banners
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage promotional banners across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/admin/banners">Manage Banners</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
