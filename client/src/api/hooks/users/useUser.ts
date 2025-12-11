import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

async function fetchUserById(id?: string) {
  const res = await apiRequest("GET", `/api/user/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

export function useUser(id?: string) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id, // only runs if id is truthy
  });
}
