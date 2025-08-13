import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertFeaturedSpot } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateFeaturedSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertFeaturedSpot) => {
      const payload = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };

      const res = await apiRequest(
        "POST",
        "/api/admin/featured-spots",
        payload
      );

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.message || "Failed to create featured spot");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/featured-spots"],
      });
      toast({
        title: "Featured Spot created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating Featured Spot",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}
