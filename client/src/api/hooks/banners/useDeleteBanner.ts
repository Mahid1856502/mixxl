import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/banners/${id}`, {});
      if (!res.ok) throw new Error("Failed to delete banner");
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Banner deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my/banners"] });
    },
  });
}
