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
