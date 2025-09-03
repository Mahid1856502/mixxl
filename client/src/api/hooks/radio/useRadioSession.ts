import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertRadioSession, RadioSession } from "@shared/schema";

// Fetch single session
export function useRadioSession() {
  return useQuery<
    RadioSession & {
      host: {
        id: string;
        username: string;
        profileImage: string | null;
        bio: string | null;
      } | null;
    },
    Error
  >({
    queryKey: ["radioSession"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/radio/active-session`);
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json() as Promise<
        RadioSession & {
          host: {
            id: string;
            username: string;
            profileImage: string | null;
            bio: string | null;
          } | null;
        }
      >;
    },
    staleTime: 0,
  });
}

// Fetch all sessions
export function useRadioSessions() {
  return useQuery<RadioSession[], Error>({
    queryKey: ["radioSessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/radio/sessions`);
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json() as Promise<RadioSession[]>;
    },
    staleTime: 0,
  });
}

// Create session
export function useCreateRadioSession() {
  const queryClient = useQueryClient();

  return useMutation<
    RadioSession,
    Error,
    InsertRadioSession // input
  >({
    mutationFn: async (newSession) => {
      const res = await apiRequest("POST", "/api/radio/sessions", newSession);
      if (!res.ok) throw new Error("Failed to create session");
      return res.json() as Promise<RadioSession>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioSessions"] }); // Refresh list
      queryClient.invalidateQueries({ queryKey: ["radioSession"] });
      // Force refetch immediately
      queryClient.refetchQueries({ queryKey: ["radioSession"] });
      queryClient.refetchQueries({ queryKey: ["radioSessions"] });
    },
  });
}

// Update session
export function useUpdateRadioSession() {
  const queryClient = useQueryClient();

  return useMutation<
    RadioSession,
    Error,
    RadioSession & { id: string } // input with id
  >({
    mutationFn: async ({ id, ...data }) => {
      const res = await apiRequest("PATCH", `/api/radio/sessions/${id}`, data);
      if (!res.ok) throw new Error("Failed to update session");
      return res.json() as Promise<RadioSession>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["radioSessions"] }); // Refresh list
      queryClient.invalidateQueries({ queryKey: ["radioSession"] });

      // Force refetch immediately
      queryClient.refetchQueries({ queryKey: ["radioSession"] });
      queryClient.refetchQueries({ queryKey: ["radioSessions"] });
    },
  });
}

// Delete session
export function useDeleteRadioSession() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    string // session ID
  >({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/radio/sessions/${id}`);
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["radioSessions"] });

      // Force refetch immediately
      queryClient.refetchQueries({ queryKey: ["radioSession"] });
      queryClient.refetchQueries({ queryKey: ["radioSessions"] });
    },
  });
}
