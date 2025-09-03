import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RadioSession } from "@shared/schema";

// Go Live hook
export function useGoLive() {
  const queryClient = useQueryClient();

  return useMutation<RadioSession, Error, string>({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/radio/sessions/${sessionId}/go-live`
      );
      if (!res.ok) throw new Error("Failed to start session");
      return res.json() as Promise<RadioSession>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioSession"] });
      queryClient.invalidateQueries({ queryKey: ["radioSessions"] });
      // queryClient.setQueryData(["radioSessions"], []); // immediately clear old data

      // Force refetch immediately
      // queryClient.refetchQueries({ queryKey: ["radioSession"] });
      // queryClient.refetchQueries({ queryKey: ["radioSessions"] });
    },
  });
}

// End Session hook
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation<RadioSession, Error, string>({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/radio/sessions/${sessionId}/end`
      );
      if (!res.ok) throw new Error("Failed to end session");
      return res.json() as Promise<RadioSession>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioSession"] });
      queryClient.invalidateQueries({ queryKey: ["radioSessions"] });
      // queryClient.setQueryData(["radioSession"], null); // immediately clear old data

      // // Force refetch immediately
      // queryClient.refetchQueries({ queryKey: ["radioSession"] });
      // queryClient.refetchQueries({ queryKey: ["radioSessions"] });
    },
  });
}
