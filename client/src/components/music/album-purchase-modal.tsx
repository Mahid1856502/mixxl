import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Crown, CheckCircle, Music, Disc } from "lucide-react";
import { AlbumExtended } from "@shared/schema";
import { useBuyAlbum } from "@/api/hooks/tracks/useBuyTracks";

interface PurchaseAlbumModalProps {
  album: AlbumExtended | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AlbumPurchaseModal({
  album,
  isOpen,
  onClose,
}: PurchaseAlbumModalProps) {
  console.log("isOpen", isOpen);
  console.log("album", album);
  const { mutate: purchase, isPending } = useBuyAlbum();

  const handlePurchase = () => {
    if (album?.id) {
      purchase({
        albumId: album.id,
      });
    }
  };

  if (!album) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Purchase Album</span>
          </DialogTitle>
          <DialogDescription>
            Get the full album bundle and access every track included.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Album Preview */}
          <Card className="glass-effect border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500/20 to-pink-500/20">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{album.title}</h3>
                  <p className="text-muted-foreground">
                    by {album?.artistName || "Artist"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Album Price</span>
              <span className="font-semibold text-lg">
                £{Number(album.price).toFixed(2)}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">What’s included:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All tracks in this album</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited streaming & downloads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Add to playlists and collections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Support the artist directly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isPending}
              className="flex-1 mixxl-gradient text-white"
            >
              {isPending ? (
                <>
                  <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Buy for £{Number(album.price).toFixed(2)}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment processed by Stripe. You’ll be redirected to complete
            your purchase.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
