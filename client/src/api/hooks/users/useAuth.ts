import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema"; // adjust if needed

export function useAuth(token?: string) {
  return useQuery<User, Error>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch current user");
      return res.json() as Promise<User>;
    },
    enabled: !!token, // only fetch if token exists
    staleTime: Infinity, // cache forever until invalidated
  });
}
