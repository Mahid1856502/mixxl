import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TrackCard from "@/components/music/track-card";
import PlaylistCard from "@/components/music/playlist-card";
import UserCard from "@/components/social/user-card";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  Search,
  Filter,
  TrendingUp,
  Music,
  Users,
  Heart,
  Radio,
  Shuffle,
  Compass,
  Lock,
} from "lucide-react";
import { useFeaturedArtists } from "@/api/hooks/artists/useArtists";
import { usePublicPlaylists } from "@/api/hooks/playlist/usePlaylist";
import { useRadioSession } from "@/api/hooks/radio/useRadioSession";
import { Link, useLocation } from "wouter";
import { useTracks } from "@/api/hooks/tracks/useTracks";
import { GENRES, MOODS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { buildSearchQuery } from "@/lib/query-builder";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most_played", label: "Most Played" },
  { value: "most_liked", label: "Most Liked" },
  { value: "alphabetical", label: "A-Z" },
];

export default function Discover() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedMood, setSelectedMood] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { user } = useAuth();
  const [searchTrigger, setSearchTrigger] = useState(""); // new state
  const [showFilters, setShowFilters] = useState(false);

  const { data: tracks = [], isLoading: tracksLoading } = useTracks();

  const { data: playlists = [] } = usePublicPlaylists();

  const { data: featuredArtists = [] } = useFeaturedArtists({
    search: searchTrigger,
    genre: selectedGenre !== "all" ? selectedGenre : undefined,
    mood: selectedMood !== "all" ? selectedMood : undefined,
    sort: sortBy,
  });

  const { data: radioSession } = useRadioSession();

  useEffect(() => {
    const queryObj = buildSearchQuery({
      genre: selectedGenre,
      mood: selectedMood,
      sort: sortBy,
    });
    const queryString = new URLSearchParams(queryObj).toString();
    setLocation(`/discover?${queryString}`, { replace: true });
  }, [searchQuery, selectedGenre, selectedMood, sortBy]);

  // Parse URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    setSearchQuery(params.get("search") || "");
    setSelectedGenre(params.get("genre") || "all");
    setSelectedMood(params.get("mood") || "all");
    setSortBy(params.get("sort") || "newest");
  }, []);

  const filteredTracks = tracks.filter((track) => {
    if (selectedGenre !== "all" && track.genre !== selectedGenre) {
      return false;
    }
    return true;
  });

  const handleSearch = () => {
    setSearchTrigger(searchQuery); // trigger API call

    const queryObj = buildSearchQuery({
      search: searchQuery,
      genre: selectedGenre,
      mood: selectedMood,
      sort: sortBy,
    });

    const queryString = new URLSearchParams(queryObj).toString();
    setLocation(`/discover?${queryString}`, { replace: true });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Compass className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold mixxl-gradient-text">
              Discover Music
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore new sounds, discover emerging artists, and find your next
            favorite track
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="glass-effect border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for tracks, artists, or genres..."
                  className="pl-10 bg-white/5 border-white/10 h-12 text-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSearch()}
                  className="absolute right-1"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Genre Tags */}
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Button
                      key={genre}
                      variant={selectedGenre === genre ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGenre(genre)}
                      className={
                        selectedGenre === genre
                          ? "mixxl-gradient text-white"
                          : ""
                      }
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
                <Button
                  size="icon"
                  className="px-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mood
                    </label>
                    <Select
                      value={selectedMood}
                      onValueChange={setSelectedMood}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="" value="all">
                          All Moods
                        </SelectItem>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedGenre("all");
                        setSortBy("newest");
                        setSelectedMood("all");
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Radio Banner */}
        {radioSession && (
          <Card className="glass-effect border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
                    <Badge variant="destructive" className="bg-red-500">
                      LIVE
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Radio is Live Now!
                    </h3>
                    <p className="text-muted-foreground">
                      {radioSession?.title} • {radioSession?.listenerCount ?? 0}{" "}
                      listeners
                    </p>
                  </div>
                </div>
                <Link href="/radio">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    <Radio className="w-4 h-4 mr-2" />
                    Listen Live
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="tracks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracks" className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Tracks</span>
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Playlists</span>
            </TabsTrigger>
            <TabsTrigger
              value="artists"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Artists</span>
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : "All Tracks"}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{filteredTracks.length} tracks found</span>
                <Button variant="ghost" size="sm">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle Play
                </Button>
              </div>
            </div>

            {/* Tracks Grid */}
            {tracksLoading ? (
              <div className="gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="glass-effect border-white/10">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square w-full rounded-t-lg" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTracks.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No tracks found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? "Try adjusting your search terms or filters"
                      : "Be the first to upload a track!"}
                  </p>
                  {!searchQuery && user?.role === "artist" && (
                    <Button className="mixxl-gradient text-white">
                      Upload First Track
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Preview Mode Tracks Section */}
                {filteredTracks.some((track) => track.hasPreviewOnly) && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-purple-500" />
                        Preview Tracks
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Purchase to unlock full versions
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {filteredTracks
                        .filter((track) => track.hasPreviewOnly)
                        .map((track) => (
                          <TrackCard
                            key={`preview-${track.id}`}
                            track={track}
                            variant="preview"
                            className="mb-3"
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Regular Tracks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTracks
                    .filter((track) => !track.hasPreviewOnly)
                    .map((track) => (
                      <TrackCard key={track.id} track={track} variant="card" />
                    ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Playlists</h2>
              <p className="text-muted-foreground">
                {playlists.length} playlists
              </p>
            </div>

            {playlists.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No playlists yet
                  </h3>
                  <p className="text-muted-foreground">
                    Curated playlists will appear here as users create them
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist: any) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="artists" className="space-y-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold">Featured Artists</h2>
              <p className="text-muted-foreground">
                {featuredArtists.length} artists
              </p>
            </div>

            {featuredArtists.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No featured artists yet
                  </h3>
                  <p className="text-muted-foreground">
                    Talented artists will be featured here as they join the
                    platform
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtists.map((artist) => (
                  <UserCard key={artist.id} user={artist} variant="detailed" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <h2 className="text-2xl font-bold">Trending Now</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trending Tracks */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Top Tracks This Week</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTracks.slice(0, 5).map((track) => (
                      <TrackCard key={track.id} track={track} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rising Artists */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Rising Artists</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featuredArtists.slice(0, 5).map((artist: any, index) => (
                      <div
                        key={artist.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <span className="font-semibold text-white/70">
                            {artist.firstName?.[0] || artist.username[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {artist.firstName && artist.lastName
                              ? `${artist.firstName} ${artist.lastName}`
                              : artist.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {artist.followers || 0} followers
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
