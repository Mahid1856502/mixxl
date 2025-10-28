import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Logo } from "@/components/ui/logo";
import {
  Bell,
  User,
  Settings,
  LogOut,
  Upload,
  Radio,
  Compass,
  LayoutDashboard,
  Shield,
  Wallet,
  Music,
} from "lucide-react";
import { useUnreadNotificationCount } from "@/api/hooks/notifications/useNotifications";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { isConnected, messages } = useWebSocket();

  const { data: unreadData } = useUnreadNotificationCount();
  const [unreadCount, setUnreadCount] = useState(unreadData?.count ?? 0);

  useEffect(() => {
    setUnreadCount(unreadData?.count ?? 0); // sync with initial fetch
  }, [unreadData]);

  useEffect(() => {
    if (!messages?.length) return;

    const latest = messages[messages.length - 1];

    if (latest.type === "new_notification") {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages]);

  let navigation = [
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Radio", href: "/radio", icon: Radio },
  ];

  let userNavigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        // { name: "Upload", href: "/upload", icon: Upload, roles: ["artist"] },
        {
          name: "Upload",
          type: "dropdown",
          icon: Upload,
          roles: ["artist"],
          items: [
            { name: "Upload Track", href: "/upload", icon: Music },
            {
              name: "Release Album",
              href: "/upload/album",
              icon: LayoutDashboard,
            },
          ],
        },
        { name: "Profile", href: `/profile/${user.id}`, icon: User },
      ]
    : [];

  if (user?.role === "admin") {
    // Remove Dashboard for admins
    userNavigation = userNavigation.filter((item) => item.name !== "Dashboard");
    userNavigation.push({ name: "Admin", href: "/admin", icon: Shield });
  }

  if (user?.role === "DJ") {
    // Remove Dashboard for admins
    userNavigation = userNavigation.filter((item) => item.name !== "Dashboard");
    navigation = navigation.filter((item) => item.name !== "Discover");
  }

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and primary navigation */}
          <div className="flex items-center space-x-8">
            {/* Hide logo completely on dashboard */}
            <Link href="/" className="flex items-center group">
              <Logo
                size="xxl"
                variant="full"
                className="group-hover:scale-105 transition-transform duration-200"
              />
            </Link>

            {/* Only show navigation on non-dashboard pages */}
            {!location.startsWith("/dashboard") && (
              <div className="hidden md:flex items-center space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search and user menu */}
          <div className="flex items-center space-x-4">
            {/* WebSocket connection indicator */}
            {user && (
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            )}

            {/* Search button */}
            {/* <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button> */}

            {/* Notifications */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setLocation("/notifications")}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 hover:bg-red-600 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User menu or auth buttons */}
            {user ? (
              <>
                {/* User navigation for mobile */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <LayoutDashboard className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {userNavigation.flatMap((item) => {
                        if (item.roles && !item.roles.includes(user.role))
                          return [];

                        // if normal link
                        if (item.type !== "dropdown") {
                          const Icon = item.icon;
                          return [
                            <DropdownMenuItem key={item.name} asChild>
                              <Link
                                href={item.href!}
                                className="flex items-center space-x-2"
                              >
                                <Icon className="w-4 h-4" />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenuItem>,
                          ];
                        }

                        // if dropdown (Upload) → flatten sub-items
                        return item.items.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <DropdownMenuItem key={sub.name} asChild>
                              <Link
                                href={sub.href}
                                className="flex items-center space-x-2"
                              >
                                <SubIcon className="w-4 h-4" />
                                <span>{sub.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        });
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop user navigation */}
                <div className="hidden md:flex items-center space-x-4">
                  {userNavigation.map((item) => {
                    if (item.roles && !item.roles.includes(user.role))
                      return null;

                    // Dropdown case
                    if (item.type === "dropdown") {
                      return (
                        <DropdownMenu key={item.name}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                location.startsWith("/upload")
                                  ? "bg-primary/20 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.items.map((sub) => {
                              const SubIcon = sub.icon;
                              return (
                                <DropdownMenuItem key={sub.name} asChild>
                                  <Link
                                    href={sub.href}
                                    className="flex items-center space-x-2"
                                  >
                                    <SubIcon className="w-4 h-4" />
                                    <span>{sub.name}</span>
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    // Default Link case
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href!}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href!)
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* User avatar dropdown - bigger on dashboard */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative rounded-full ${
                        location.startsWith("/dashboard")
                          ? "h-12 w-12"
                          : "h-8 w-8"
                      }`}
                    >
                      <Avatar
                        className={
                          location.startsWith("/dashboard")
                            ? "h-12 w-12"
                            : "h-8 w-8"
                        }
                      >
                        <AvatarImage
                          className="object-cover"
                          src={user.profileImage ?? ""}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.fullName?.[0]?.toUpperCase() ||
                            user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "artist" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/artist/earnings"
                          className="flex items-center space-x-2"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Earnings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile-settings"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="mixxl-gradient text-white">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
