// hooks/useFeedbacks.ts
import { apiRequest } from "@/lib/queryClient";
import { Contact } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

async function fetchFeedbacks(): Promise<Contact[]> {
  const res = await apiRequest("GET", "/api/feedbacks");
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

export function useFeedbacks() {
  return useQuery<Contact[]>({
    queryKey: ["feedbacks"],
    queryFn: fetchFeedbacks,
    staleTime: 1000 * 60 * 2, // cache for 2 minutes
  });
}
