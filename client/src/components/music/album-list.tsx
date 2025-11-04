import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Crown } from "lucide-react";
import { ConfirmDialog } from "../common/ConfirmPopup";
import AlbumPurchaseModal from "./album-purchase-modal";
import { AlbumExtended, User } from "@shared/schema";

type AlbumsTabProps = {
  albums: AlbumExtended[];
  isOwnProfile?: boolean;
  onDelete?: (id: string) => Promise<void> | void;
  isPending: boolean;
  user?: User | null;
};

export const AlbumsList = ({
  albums,
  isOwnProfile = false,
  onDelete,
  user,
  isPending = false,
}: AlbumsTabProps) => {
  console.log("albums", albums);
  const [, setLocation] = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumExtended | null>(
    null
  );
  const handlePurchase = (album: AlbumExtended) => {
    setSelectedAlbum(album);
    setShowPurchaseModal(true);
  };

  console.log("showPurchaseModal", showPurchaseModal);

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
          onClick={() => {
            setLocation(`/view-album/${album.id}`);
          }}
          className="group bg-card border border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0 p-3">
            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-slate-800">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.title ?? "Album cover"}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    console.warn(
                      "Album cover failed to load:",
                      album.coverImage
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
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {album?.artistName || "Unknown Artist"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {album.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Edit + Delete (only for own profile) */}
          <div
            className="flex items-center gap-1 pr-3"
            onClick={(e) => e.stopPropagation()} // prevent triggering view
          >
            {isOwnProfile && user?.role === "artist" ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setLocation(`/upload/album/${album.id}`)}
                  aria-label={`Edit ${album.title ?? "album"}`}
                  className="p-1 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeleteOpen(true);
                    setSelectedAlbum(album);
                  }}
                  aria-label={`Edit ${album.title ?? "album"}`}
                  className="p-1 rounded-md hover:bg-red-500 hover:text-white"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </>
            ) : (
              album.purchaseStatus !== "succeeded" && (
                <Button
                  size="sm"
                  onClick={() => handlePurchase(album)}
                  className="h-8 px-3 text-xs mixxl-gradient text-white"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Buy £{album.price}
                </Button>
              )
            )}
          </div>
        </Card>
      ))}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Album"
        description={
          <>
            Are you sure you want to delete the Album{" "}
            <strong>{selectedAlbum?.title || "Untitled"}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (selectedAlbum?.id) {
            try {
              await onDelete?.(String(selectedAlbum.id));
              setDeleteOpen(false);
              setSelectedAlbum(null);
            } catch (err) {
              console.error("Delete failed:", err);
            }
          }
        }}
        isPending={isPending}
      />
      <AlbumPurchaseModal
        album={showPurchaseModal ? selectedAlbum : null}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </div>
  );
};
