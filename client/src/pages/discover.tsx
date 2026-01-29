import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackCard from "@/components/music/track-card";
import PlaylistCard from "@/components/music/playlist-card";
import {
  TrendingUp,
  Music,
  Users,
  Heart,
  Radio,
  Compass,
  Album,
} from "lucide-react";
import { useFeaturedArtists } from "@/api/hooks/artists/useArtists";
import { usePublicPlaylists } from "@/api/hooks/playlist/usePlaylist";
import { useRadioSession } from "@/api/hooks/radio/useRadioSession";
import { Link } from "wouter";
import { useTracks } from "@/api/hooks/tracks/useTracks";
import ArtistsTab from "@/components/discover/artists-tab";
import TracksTab from "@/components/discover/tracks-tab";
import FiltersCard from "@/components/discover/filter-card";
import { useQueryParams } from "@/hooks/use-query-params";
import { Playlist } from "@shared/schema";
import RisingArtists from "@/components/discover/rising-tab";
import { useAllAlbums } from "@/api/hooks/tracks/useAlbums";
import { AlbumsList } from "@/components/music/album-list";

export default function Discover() {
  const [params, setParams] = useQueryParams({
    sort: "newest",
    genre: "all",
    mood: "all",
    search: "",
    tab: "tracks",
  });

  const { genre, mood, sort, search, tab } = params;

  const { data: tracks = [], isLoading: tracksLoading } = useTracks({
    enable: tab === "tracks" || tab === "trending",
    search,
  });

  const { data: albums = [], isLoading: albumsLoading } = useAllAlbums({
    enable: tab === "albums",
  });

  const { data: playlists = [] } = usePublicPlaylists({
    enable: tab === "playlist",
    search,
    genre: genre !== "all" ? genre : undefined,
    mood: mood !== "all" ? mood : undefined,
  });

  const { data: featuredArtists = [], isLoading: artistsLoading } =
    useFeaturedArtists({
      enable: tab === "artists" || tab === "trending",
      search,
      genre: genre !== "all" ? genre : undefined,
      mood: mood !== "all" ? mood : undefined,
    });

    console.log("featuredArtists",featuredArtists);

  const { data: radioSession } = useRadioSession();

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

        <FiltersCard params={params} setParams={setParams} />

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
        <Tabs
          value={tab}
          onValueChange={(tab) => setParams({ tab })}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tracks" className="flex items-center space-x-2">
              <Music className="w-4 h-4 sm:block hidden" />
              <span className="sm:text-sm text-xs">Tracks</span>
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center space-x-2">
              <Album className="w-4 h-4 sm:block hidden" />
              <span className="sm:text-sm text-xs">Albums</span>
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4 sm:block hidden" />
              <span className="sm:text-sm text-xs">Playlists</span>
            </TabsTrigger>
            <TabsTrigger
              value="artists"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4 sm:block hidden" />
              <span className="sm:text-sm text-xs">Artists</span>
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4 sm:block hidden" />
              <span className="sm:text-sm text-xs">Trending</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tracks">
            <TracksTab
              sort={sort}
              genre={genre}
              mood={mood}
              searchQuery={search}
              tracks={tracks}
              tracksLoading={tracksLoading}
            />
          </TabsContent>
          <TabsContent value="albums">
            {/* <TracksTab
              sort={sort}
              genre={genre}
              mood={mood}
              searchQuery={search}
              tracks={tracks}
              tracksLoading={tracksLoading}
            /> */}
            <AlbumsList albums={albums || []} isPending={albumsLoading} />
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
                {playlists.map((playlist: Playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="artists">
            {tab === "artists" && (
              <ArtistsTab
                featuredArtists={featuredArtists}
                sort={sort}
                isLoading={artistsLoading}
                filters={params}
              />
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
                    {tracks.slice(0, 5).map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isLoading={tracksLoading}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rising Artists */}
              <RisingArtists artists={featuredArtists} filters={params} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
