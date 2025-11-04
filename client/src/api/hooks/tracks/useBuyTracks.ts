import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BuyTrackResponse {
  checkoutUrl: string;
}

interface BuyTrackInput {
  trackId: string;
}

export const useBuyTrack = (
  onSuccessCallback?: () => void,
  onClose?: () => void
) => {
  return useMutation<BuyTrackResponse, any, BuyTrackInput>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/buy-track", data);
      if (!response.ok) throw new Error("Failed to create broadcast");
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Purchase Initiated!",
        description: `Redirecting you to Stripe Checkout for "${variables.trackId}"...`,
      });

      // Call optional callbacks
      if (onSuccessCallback) onSuccessCallback();
      if (onClose) onClose();

      // Redirect buyer to Stripe Checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error?.message || "Unable to complete purchase",
      });
    },
  });
};

interface BuyAlbumResponse {
  checkoutUrl: string;
}

interface BuyAlbumInput {
  albumId: string;
}

export const useBuyAlbum = (
  onSuccessCallback?: () => void,
  onClose?: () => void
) => {
  return useMutation<BuyAlbumResponse, any, BuyAlbumInput>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/buy-album", data);
      if (!response.ok) throw new Error("Failed to initiate album purchase");
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Purchase Initiated!",
        description: `Redirecting you to Stripe Checkout for album "${variables.albumId}"...`,
      });

      // Optional callbacks
      if (onSuccessCallback) onSuccessCallback();
      if (onClose) onClose();

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error?.message || "Unable to complete album purchase",
      });
    },
  });
};
