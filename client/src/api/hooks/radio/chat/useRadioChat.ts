import { apiRequest } from "@/lib/queryClient";
import { RadioChatMessageWithUser } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function useRadioChatBySession(
  sessionId: string | undefined,
  userId: string | undefined
) {
  return useQuery<RadioChatMessageWithUser[], Error>({
    queryKey: ["radioChat", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("Missing sessionId");
      const res = await apiRequest("GET", `/api/radio-chat/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch chat messages");
      return res.json() as Promise<RadioChatMessageWithUser[]>;
    },
    enabled: !!sessionId && !!userId, // don’t run until we have a sessionId and userId
    staleTime: 0,
  });
}
