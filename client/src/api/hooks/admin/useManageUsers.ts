import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function deleteUser(id: string) {
  const res = await apiRequest("DELETE", `/api/auth/user/${id}`);
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export async function updateUserStatus(id: string, isActive: boolean) {
  const res = await apiRequest("PATCH", `/api/auth/user/${id}/status`, {
    isActive,
  });
  if (!res.ok) throw new Error("Failed to update user status");
  return res.json();
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      // Invalidate users list so UI refetches
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateUserStatus(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateUserStatus(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}
