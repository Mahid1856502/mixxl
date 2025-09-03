import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

async function fetchUserById(id: string) {
  const res = await apiRequest("GET", `/api/user/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id, // only runs if id is truthy
  });
}
