import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart,
  Crown,
  CheckCircle,
  Music,
  Download,
  Heart,
  Share
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artistId: string;  
  artistName?: string;
  price: number;
  coverImage?: string;
  genre?: string;
  duration?: number;
}

interface PurchaseModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PurchaseModal({ 
  track, 
  isOpen, 
  onClose, 
  onSuccess 
}: PurchaseModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");

  // Fetch user's playlists for selection
  const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "playlists"],
    queryFn: () => apiRequest("GET", `/api/users/${user?.id}/playlists`).then(res => res.json()),
    enabled: !!user?.id
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: { trackId: string; playlistId?: string }) => {
      const response = await apiRequest("POST", "/api/purchases", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `"${track?.title}" has been added to your library`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "playlists"] });
      
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to complete purchase",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    purchaseMutation.mutate({
      trackId: track.id,
      playlistId: selectedPlaylist && selectedPlaylist !== "none" ? selectedPlaylist : undefined
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Purchase Track</span>
          </DialogTitle>
          <DialogDescription>
            Buy this track to add it to your collection and listen to it anytime
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Track Preview */}
          <Card className="glass-effect border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {track.coverImage ? (
                    <img 
                      src={track.coverImage} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{track.title}</h3>
                  <p className="text-muted-foreground">by {track.artistName || 'Artist'}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {track.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {track.genre}
                      </Badge>
                    )}
                    {track.duration && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Track Price</span>
              <span className="font-semibold text-lg">£{Number(track.price).toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">What's included:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Full track download</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited streaming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Add to playlists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Support the artist directly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Add to Mixxlist (Optional)</h4>
            <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a playlist to add this track to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don't add to any playlist</SelectItem>
                {playlistsLoading ? (
                  <SelectItem value="loading" disabled>Loading playlists...</SelectItem>
                ) : (
                  playlists
                    .filter((playlist: any) => playlist.type === 'mixxlist')
                    .map((playlist: any) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {playlists.filter((playlist: any) => playlist.type === 'mixxlist').length === 0 && !playlistsLoading && (
              <p className="text-xs text-muted-foreground">
                No Mixxlists found. You can create one from your profile after purchase.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={purchaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              className="flex-1 mixxl-gradient text-white"
            >
              {purchaseMutation.isPending ? (
                <>
                  <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Buy for £{Number(track.price).toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {/* Payment Info */}
          <p className="text-xs text-center text-muted-foreground">
            Secure payment processed by Stripe. You'll be redirected to complete your purchase.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}