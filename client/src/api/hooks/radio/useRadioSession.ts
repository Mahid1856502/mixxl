import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RadioSession } from "@shared/schema";

export function useRadioSessions() {
  return useQuery<RadioSession[], Error>({
    queryKey: ["radioSessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/radio/sessions");
      if (!res.ok) throw new Error("Failed to fetch radio sessions");
      return res.json() as Promise<RadioSession[]>;
    },
    staleTime: 60 * 1000, // cache for 1 minute
  });
}
