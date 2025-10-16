import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { Album } from "@shared/schema";

type AlbumsTabProps = {
  albums: Album[];
  isOwnProfile?: boolean; // show edit icon only when true
};

export const AlbumsList = ({
  albums,
  isOwnProfile = false,
}: AlbumsTabProps) => {
  const [, setLocation] = useLocation();

  if (!albums || albums.length === 0) {
    return (
      <Card className="glass-effect border-white/10">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No albums found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
      {albums.map((album) => (
        <Card
          key={album.id}
          className="bg-card p-3 border border-white/6 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex items-center"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-slate-800">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.title ?? "Album cover"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.warn(
                      "Album cover failed to load:",
                      album.coverImage,
                      album.id
                    );
                    (e.currentTarget as HTMLImageElement).style.objectFit =
                      "contain";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground/70">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {album.title ?? "Untitled"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                £{album.price}
              </p>
            </div>
          </div>

          {/* Actions: View always, Edit only if own profile */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation(`/view-album/${album.id}`)}
              aria-label={`View ${album.title ?? "album"}`}
              className="p-1 rounded-md"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {isOwnProfile && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setLocation(`/upload/album/${album.id}`)}
                aria-label={`Edit ${album.title ?? "album"}`}
                className="p-1 rounded-md"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
