import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

async function fetchUserTracks() {
  const res = await apiRequest("GET", `/api/users/tracks`);
  if (!res.ok) {
    throw new Error("Failed to fetch user tracks");
  }
  return res.json();
}

export function useUserTracks() {
  return useQuery({
    queryKey: ["userTracks"],
    queryFn: () => fetchUserTracks(),
  });
}
