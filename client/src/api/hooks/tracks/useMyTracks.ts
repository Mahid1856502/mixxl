import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

async function fetchUserTracks(userId?: string) {
  const url = userId
    ? `/api/users/tracks?userId=${userId}`
    : `/api/users/tracks`;
  const res = await apiRequest("GET", url);
  if (!res.ok) {
    throw new Error("Failed to fetch user tracks");
  }
  return res.json();
}

export function useUserTracks(enabled: boolean = false, userId?: string) {
  return useQuery({
    queryKey: ["userTracks", userId], // 👈 cache per userId
    queryFn: () => fetchUserTracks(userId),
    enabled: !!enabled,
  });
}
