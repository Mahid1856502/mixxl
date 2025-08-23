import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function useAllArtists() {
  return useQuery<User[], Error>({
    queryKey: ["allArtists"],
    queryFn: async () => {
      console.log("fetch artists");
      const res = await apiRequest("GET", "/api/artists");
      console.log("res", res);
      if (!res.ok) {
        throw new Error("Failed to fetch artists");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // cache for 5 mins, tweak as needed
  });
}
