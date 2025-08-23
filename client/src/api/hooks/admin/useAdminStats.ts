// hooks/useAdminStats.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type AdminStats = {
  users: {
    total: number;
    artists: number;
    fans: number;
    subscribed: number;
  };
  featuredSpots: {
    active: number;
  };
  broadcasts: {
    total: number;
  };
};

async function fetchAdminStats(): Promise<AdminStats> {
  const res = await apiRequest("GET", `/api/admin/stats`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlists");
  }

  return res.json();
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}
