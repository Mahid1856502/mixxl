import { apiRequest } from "@/lib/queryClient";
import { Playlist } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

async function fetchPlaylists(identifier: string): Promise<Playlist[]> {
  const res = await apiRequest("GET", `/api/users/${identifier}/playlists`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlists");
  }

  return res.json();
}

export function useUserPlaylists(identifier: string | undefined) {
  return useQuery({
    queryKey: ["userPlaylists", identifier],
    queryFn: () => fetchPlaylists(identifier!),
    enabled: !!identifier, // only fetch if identifier is defined
    staleTime: 5 * 60 * 1000, // 5 minutes cache freshness, tweak as needed
    retry: 1,
  });
}

export function usePublicPlaylists() {
  return useQuery<Playlist[], Error>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/playlists");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json() as Promise<Playlist[]>;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
