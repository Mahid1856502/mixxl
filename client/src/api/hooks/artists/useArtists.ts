import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

export function useFeaturedArtists(username?: string) {
  return useQuery<User[], Error>({
    queryKey: ["featuredArtists", username], // cache per search
    queryFn: async () => {
      const url = username
        ? `/api/featured-artists?search=${username}`
        : "/api/featured-artists";

      const res = await apiRequest("GET", url);
      if (!res.ok) throw new Error("Failed to fetch featured artists");
      return res.json() as Promise<User[]>;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
