import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

type UsersResponse = {
  users: User[];
  total: number;
  hasMore: boolean;
};

export function useAllUsers() {
  return useQuery<UsersResponse, Error>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      console.log("fetch users");
      const res = await apiRequest("GET", "/api/admin/users");
      console.log("res", res);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
