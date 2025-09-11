// useArtist.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

type FeaturedArtistsFilters = {
  userId?: string;
  search?: string;
  genre?: string;
  mood?: string;
  sort?: string;
};

export function useFeaturedArtists(filters: FeaturedArtistsFilters = {}) {
  return useQuery<User[], Error>({
    queryKey: ["featuredArtists", filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>);
      const url = `/api/featured-artists${query.toString() ? `?${query}` : ""}`;

      const res = await apiRequest("GET", url);
      if (!res.ok) throw new Error("Failed to fetch featured artists");
      return res.json() as Promise<User[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
