// useProducts.ts
import { apiRequest } from "@/lib/queryClient";
import { OrderWithItems } from "@shared/order.type";
import { useQuery } from "@tanstack/react-query";

// ---------------------------------------------------
// 1. Get Order With Order items
// ---------------------------------------------------
export function useOrder(id: string | undefined) {
  return useQuery<OrderWithItems, Error>({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/order/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
  });
}
