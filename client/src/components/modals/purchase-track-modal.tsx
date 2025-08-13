import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShoppingCart, 
  Music, 
  Plus, 
  CreditCard,
  List,
  Heart,
  Star
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import CreateMixxlistModal from "./create-mixxlist-modal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PurchaseTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: any;
}

export default function PurchaseTrackModal({ open, onOpenChange, track }: PurchaseTrackModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMixxlist, setSelectedMixxlist] = useState<string>("");
  const [showCreateMixxlist, setShowCreateMixxlist] = useState(false);

  // Get user's Mixxlists
  const { data: userMixxlists = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "mixxlists"],
    enabled: !!user?.id && open,
  });

  // Purchase track mutation
  const purchaseMutation = useMutation({
    mutationFn: async (purchaseData: { trackId: string; mixxlistId?: string }) => {
      const response = await apiRequest("POST", "/api/tracks/purchase", purchaseData);
      return response;
    },
    onSuccess: async (data) => {
      if (data.clientSecret) {
        // Handle Stripe payment
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        const { error } = await stripe.confirmPayment({
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/fan-profile`,
          },
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Payment successful
          queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "purchased-tracks"] });
          queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "mixxlists"] });
          toast({
            title: "Purchase Successful!",
            description: `"${track.title}" has been added to your collection${selectedMixxlist ? " and Mixxlist" : ""}.`,
          });
          onOpenChange(false);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase track. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tracks.",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate({
      trackId: track.id,
      mixxlistId: selectedMixxlist || undefined,
    });
  };

  if (!track) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Purchase Track
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Track Info */}
          <Card className="bg-dark-primary/50 border-gray-600">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                {track.coverImage ? (
                  <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Music className="w-8 h-8 text-pink-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{track.title}</h3>
                <p className="text-gray-400 text-sm">by {track.artist?.username || "Unknown Artist"}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                    £{track.price || "0.99"}
                  </Badge>
                  {track.genre && (
                    <Badge variant="secondary" className="text-xs">
                      {track.genre}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mixxlist Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Add to Mixxlist (Optional)</h4>
              <Badge variant="secondary" className="text-xs">
                <List className="w-3 h-3 mr-1" />
                {userMixxlists.length} Mixxlists
              </Badge>
            </div>
            
            {userMixxlists.length > 0 ? (
              <Select value={selectedMixxlist} onValueChange={setSelectedMixxlist}>
                <SelectTrigger className="bg-dark-primary border-gray-600 text-white">
                  <SelectValue placeholder="Choose a Mixxlist (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-dark-primary border-gray-600">
                  <SelectItem value="">Don't add to any Mixxlist</SelectItem>
                  {userMixxlists.map((mixxlist: any) => (
                    <SelectItem key={mixxlist.id} value={mixxlist.id}>
                      <div className="flex items-center space-x-2">
                        <List className="w-4 h-4" />
                        <span>{mixxlist.name}</span>
                        <span className="text-gray-400 text-xs">({mixxlist.trackCount} tracks)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Card className="bg-dark-primary/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <List className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-3">
                    You don't have any Mixxlists yet. Create one to organize your purchased tracks!
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateMixxlist(true)}
                    className="border-gray-600 text-gray-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Mixxlist
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="bg-gray-600" />

          {/* Purchase Summary */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Purchase Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Track Price</span>
                <span className="text-white">£{track.price || "0.99"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="text-white">£0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processing Fee</span>
                <span className="text-white">£{((parseFloat(track.price || "0.99") * 0.03)).toFixed(2)}</span>
              </div>
              <Separator className="bg-gray-600" />
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-green-400">£{track.price || "0.99"}</span>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <Heart className="w-4 h-4" />
                <span>Artist keeps 97% (£{((parseFloat(track.price || "0.99") * 0.97)).toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {purchaseMutation.isPending ? "Processing..." : `Purchase for £${track.price || "0.99"}`}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          {/* Stripe Notice */}
          <p className="text-xs text-gray-400 text-center">
            Secure payment powered by Stripe. Your card details are never stored on our servers.
          </p>
        </div>

        {/* Create Mixxlist Modal */}
        <CreateMixxlistModal 
          open={showCreateMixxlist} 
          onOpenChange={setShowCreateMixxlist} 
        />
      </DialogContent>
    </Dialog>
  );
}