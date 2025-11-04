import React from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit } from "lucide-react";
import { format } from "date-fns"; // optional
import { useAlbum } from "@/api/hooks/tracks/useAlbums";
import TrackCard from "@/components/music/track-card";

export const AlbumView = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: album, isLoading } = useAlbum(id);

  console.log("album.tracks", album?.title, album?.tracks);

  const fmtPrice = (p?: string | number | null) => {
    if (p == null || p === "" || Number.isNaN(Number(p))) return "Free";
    const value = typeof p === "string" ? Number(p) : p;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Album not found.</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="overflow-hidden glass-effect border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-slate-900">
            {album.coverImage ? (
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No cover
              </div>
            )}
          </div>

          <CardContent className="p-6 flex flex-col justify-center relative">
            <Button
              onClick={() => setLocation(`/upload/album/${album.id}`)}
              className="absolute top-0 right-0 m-4"
              size="sm"
              variant="outline"
            >
              <Edit />
              Edit
            </Button>
            <h1 className="text-2xl font-bold mb-2">{album.title}</h1>
            <h1 className="text-md font-semibold mb-2">{album.artistName}</h1>
            {album.description && (
              <p className="text-muted-foreground mb-4">{album.description}</p>
            )}

            <p className="font-medium">
              Price:{" "}
              <span className="text-primary">{fmtPrice(album.price)}</span>
            </p>

            {album.releaseDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Released {format(new Date(album.releaseDate), "PPP")}
              </p>
            )}
          </CardContent>
        </div>
      </Card>
      {/* Tracklist */}
      {album?.tracks?.length && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          <ul className="gap-4 grid grid-cols-1 md:grid-cols-2">
            {album?.tracks?.map((track: any, idx: number) => (
              <TrackCard
                track={track}
                key={track.id}
                variant="recent"
                // playable={false}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
