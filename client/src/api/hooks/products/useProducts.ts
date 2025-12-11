// useProducts.ts
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CreateProductWithVariants,
  UpdateProduct,
  ProductWithVariants,
} from "@shared/product.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------
// 1. Create Product With Variants + Inventory
// ---------------------------------------------------
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<ProductWithVariants, Error, CreateProductWithVariants>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/product", data);

      if (!res.ok) throw new Error("Failed to create product");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productsByStore"] });
      toast({
        title: "Product created successfully!",
        description: "Your new product has been added to the store.",
      });
    },
    onError: () => {
      toast({
        title: "Oops! Error creating product",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// ---------------------------------------------------
// 2. Update Product
// ---------------------------------------------------
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    ProductWithVariants,
    Error,
    { id: string; data: UpdateProduct }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/product/${id}`, data);

      if (!res.ok) throw new Error("Failed to update product");

      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["productsByStore"] });
      toast({
        title: "Product updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update product",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// ---------------------------------------------------
// 3. Get Product With Variants + Inventory
// ---------------------------------------------------
export function useProduct(id: string | undefined) {
  return useQuery<ProductWithVariants, Error>({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/product/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
  });
}

// ---------------------------------------------------
// 4. Get All Products by Store
// ---------------------------------------------------
export function useProductsByStore(
  storeId: string | undefined,
  page = 1,
  limit = 20,
  query = ""
) {
  return useQuery<
    {
      products: ProductWithVariants[];
      page: number;
      limit: number;
      totalCount: number;
    },
    Error
  >({
    queryKey: ["productsByStore", storeId, page, limit, query],
    enabled: !!storeId,
    queryFn: async () => {
      const searchParam = query ? `&query=${encodeURIComponent(query)}` : "";
      const res = await apiRequest(
        "GET",
        `/api/product/store/${storeId}?page=${page}&limit=${limit}${searchParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch store products");
      return res.json();
    },
  });
}

// ---------------------------------------------------
// 5. Delete Product
// ---------------------------------------------------
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<{ success: true }, Error, string>({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/product/${id}`);
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["productsByStore"] });
      toast({
        title: "Product deleted successfully!",
        description: "The product has been removed from the store.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete product",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
}
