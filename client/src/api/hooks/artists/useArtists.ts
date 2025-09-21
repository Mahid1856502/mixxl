// useArtist.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Artist } from "@shared/schema";

export type DiscoverFilters = {
  enable?: boolean;
  userId?: string;
  search?: string;
  genre?: string;
  mood?: string;
  sort?: string;
  submitToRadio?: boolean;
};

export function useFeaturedArtists(filters: DiscoverFilters = {}) {
  return useQuery<Artist[], Error>({
    queryKey: ["featuredArtists", filters?.search ?? undefined],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>);
      const url = `/api/featured-artists${query.toString() ? `?${query}` : ""}`;

      const res = await apiRequest("GET", url);
      if (!res.ok) throw new Error("Failed to fetch featured artists");
      return res.json() as Promise<Artist[]>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!filters.enable,
  });
}
