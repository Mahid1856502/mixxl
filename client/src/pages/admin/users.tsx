import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  User as UserIcon,
  Mail,
  Calendar,
  Crown,
  Shield,
  Trash,
  Plus,
} from "lucide-react";
import { Link } from "wouter";
import { useAllUsers } from "@/api/hooks/users/useAllUsers";
import { User } from "@shared/schema";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { useDeleteUser } from "@/api/hooks/admin/useManageUsers";
import { CreateDJModal } from "@/components/modals/create-dj-modal";
import { useAuth } from "@/hooks/use-auth";

export default function UsersAdmin() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [open, setOpen] = useState(false);

  // Column filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all"); // verified / unverified
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // active / inactive
  const [joinedAfter, setJoinedAfter] = useState("");
  const [joinedBefore, setJoinedBefore] = useState("");

  const { data: usersData, isLoading } = useAllUsers();
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "artist":
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case "fan":
        return <Shield className="h-4 w-4 text-green-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800";
      case "artist":
        return "bg-blue-100 text-blue-800";
      case "fan":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers =
    usersData?.users?.filter((user: User) => {
      let matchesSearch = true;
      let matchesRole = true;
      let matchesEmail = true;
      let matchesSubscription = true;
      let matchesStatus = true;
      let matchesDate = true;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          `${user.fullName}`.toLowerCase().includes(query);
      }

      // Role filter
      if (roleFilter !== "all") {
        matchesRole = user.role === roleFilter;
      }

      // Email verified filter
      if (emailFilter === "verified") {
        matchesEmail = !!user.emailVerified;
      } else if (emailFilter === "unverified") {
        matchesEmail = !user.emailVerified;
      }

      // Subscription filter
      if (subscriptionFilter !== "all") {
        matchesSubscription = user.subscriptionStatus === subscriptionFilter;
      }

      if (statusFilter === "active") {
        matchesStatus = user.isActive === true;
      } else if (statusFilter === "inactive") {
        matchesStatus = user.isActive === false;
      }

      // Date filter
      if (joinedAfter) {
        matchesDate =
          matchesDate &&
          !!user.createdAt &&
          new Date(user.createdAt) >= new Date(`${joinedAfter}T00:00:00`);
      }

      if (joinedBefore) {
        matchesDate =
          matchesDate &&
          !!user.createdAt &&
          new Date(user.createdAt) <= new Date(`${joinedBefore}T23:59:59`);
      }

      return (
        matchesSearch &&
        matchesRole &&
        matchesEmail &&
        matchesSubscription &&
        matchesStatus &&
        matchesDate
      );
    }) || [];

  async function handleDelete(id: string) {
    deleteUser(id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedUser(null);
      },
      onError: () => {
        alert("Error deleting banner.");
      },
    });
  }

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
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-400">View and manage platform users</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Link href="/admin">← Back to Dashboard</Link>
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setOpen(true)}
            >
              <Plus /> Add DJ
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
            <CardDescription>
              Search and filter users by any column
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by username, email, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="fan">Fan</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Status
                </label>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscription */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Subscription
                </label>
                <Select
                  value={subscriptionFilter}
                  onValueChange={setSubscriptionFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Joined After
                </label>
                <Input
                  type="date"
                  value={joinedAfter}
                  onChange={(e) => setJoinedAfter(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Joined Before
                </label>
                <Input
                  type="date"
                  value={joinedBefore}
                  onChange={(e) => setJoinedBefore(e.target.value)}
                />
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setEmailFilter("all");
                  setSubscriptionFilter("all");
                  setStatusFilter("all");
                  setJoinedAfter("");
                  setJoinedBefore("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Users ({filteredUsers.length})
              <div className="text-sm font-normal text-gray-500">
                Total: {usersData?.total || 0}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              @{user.username}
                              {user.emailVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <Badge
                            variant={
                              user.emailVerified ? "default" : "secondary"
                            }
                          >
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.subscriptionStatus ? (
                          <Badge
                            className={getSubscriptionBadgeColor(
                              user.subscriptionStatus
                            )}
                          >
                            {user.subscriptionStatus}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2 items-center flex">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/profile/${user.username}`}>
                            View Profile
                          </Link>
                        </Button>
                        {currentUser?.id !== user?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (currentUser?.id !== user?.id) {
                                setSelectedUser(user);
                                setDeleteOpen(true);
                              }
                            }}
                          >
                            <Trash />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No users found matching your criteria
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete the user{" "}
            <strong>{selectedUser?.username || "Untitled"}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (selectedUser?.id) {
            handleDelete(selectedUser.id);
          }
        }}
        isPending={isPending}
      />
      <CreateDJModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
