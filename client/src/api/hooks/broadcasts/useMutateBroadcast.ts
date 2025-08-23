import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminBroadcast, InsertAdminBroadcast } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

// --- Create Broadcast ---
export function useCreateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<InsertAdminBroadcast>) => {
      const res = await apiRequest("POST", "/api/admin/broadcasts", data);
      if (!res.ok) throw new Error("Failed to create broadcast");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBroadcasts"] });
      toast({ title: "Broadcast created successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating broadcast",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// --- Update Broadcast ---
export function useUpdateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertAdminBroadcast>;
    }) => {
      const res = await apiRequest("PUT", `/api/admin/broadcasts/${id}`, data);
      if (!res.ok) throw new Error("Failed to update broadcast");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBroadcasts"] });
      toast({ title: "Broadcast updated successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating broadcast",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/broadcasts/${id}/send`);
      if (!res.ok) throw new Error("Failed to send broadcast");
      return res.json();
    },
    onSuccess: (data: { sentCount: number }) => {
      // Invalidate and immediately refetch allBroadcasts
      queryClient.invalidateQueries({ queryKey: ["allBroadcasts"] });
      queryClient.refetchQueries({ queryKey: ["allBroadcasts"] });

      toast({
        title: "Broadcast sent successfully!",
        description: `Sent to ${data.sentCount} users`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending broadcast",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
