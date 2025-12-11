import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertStore, Store, UpdateStore } from "@shared/store.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------
// 1. Setup Store (POST /api/store)
// ---------------------------------------------
export function useSetupStore() {
  const queryClient = useQueryClient();

  return useMutation<Store, Error, InsertStore>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/store", data);

      if (!res.ok) throw new Error("Failed to setup store");

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["storeByUser", data.userId] });
      toast({
        title: "Store created successfully!",
        description: "Your store has been set up and is ready to use.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create store",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// ---------------------------------------------
// 2. Update Store (PUT /api/store/:id)
// ---------------------------------------------
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation<Store, Error, { id: string; data: UpdateStore }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/store/${id}`, data);

      if (!res.ok) throw new Error("Failed to update store");

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["storeByUser", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["storeByHandle", undefined] });
      toast({
        title: "Store updated successfully!",
        description: "Your store information has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update store",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// ---------------------------------------------
// 3. Get Store by User ID (GET /api/store/user/:userId)
// ---------------------------------------------
export function useStoreByUser(userId: string | undefined) {
  return useQuery<Store | null, Error>({
    queryKey: ["storeByUser", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/store/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch store by user");
      return res.json();
    },
  });
}
