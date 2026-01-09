import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DiscoverFilters } from "../artists/useArtists";
import { Artist } from "@shared/schema";
import { useAuth } from "@/provider/use-auth";

export const useFollowUser = (
  userId: string,
  username?: string,
  filters?: DiscoverFilters
) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest("POST", `/api/users/${userId}/follow`, {}),

    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["featuredArtists"] });

      const previousData = queryClient.getQueryData<Artist[]>([
        "featuredArtists",
        filters?.search ?? undefined,
      ]);

      if (previousData) {
        queryClient.setQueryData<Artist[]>(
          ["featuredArtists", filters?.search ?? undefined],
          (old) =>
            old?.map((artist) =>
              artist.id === userId
                ? { ...artist, isFollowing: true } // 👈 mark as following
                : artist
            ) ?? []
        );
      }

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["featuredArtists", filters?.search ?? undefined],
          context.previousData
        );
      }
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["featuredArtists"],
        exact: false,
      });
    },

    onSuccess: () => {
      toast({
        title: "Now following",
        description: `You are now following @${username}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", currentUser?.id, "followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", currentUser?.id, "following"],
      });
    },
  });
};

export const useUnfollowUser = (
  userId: string,
  username?: string,
  filters?: DiscoverFilters
) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/users/${userId}/follow`, {}),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["featuredArtists"] });

      const previousData = queryClient.getQueryData<Artist[]>([
        "featuredArtists",
        filters?.search ?? undefined,
      ]);

      if (previousData) {
        queryClient.setQueryData<Artist[]>(
          ["featuredArtists", filters?.search ?? undefined],
          (old) =>
            old?.map((artist) =>
              artist.id === userId
                ? { ...artist, isFollowing: false } // 👈 mark as unfollowed
                : artist
            ) ?? []
        );
      }

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["featuredArtists", filters?.search ?? undefined],
          context.previousData
        );
      }
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["featuredArtists"],
        exact: false,
      });
    },

    onSuccess: () => {
      toast({
        title: "Unfollowed",
        description: `You unfollowed @${username}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", currentUser?.id, "followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", currentUser?.id, "following"],
      });
    },
  });
};
