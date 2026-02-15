import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type DemoSubmissionWithDetails = {
  id: string;
  userId: string;
  message: string | null;
  agreedToTerms: boolean;
  subscribedToNewsletter: boolean | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    socialMedia: unknown;
    bio: string | null;
  };
  tracks: {
    id: string;
    demoSubmissionId: string;
    title: string;
    fileUrl: string;
    sortOrder: number | null;
    createdAt: Date | null;
  }[];
};

async function fetchDemoSubmissions(): Promise<DemoSubmissionWithDetails[]> {
  const res = await apiRequest("GET", "/api/admin/demo-submissions");
  return res.json();
}

export function useDemoSubmissions() {
  return useQuery<DemoSubmissionWithDetails[]>({
    queryKey: ["admin", "demo-submissions"],
    queryFn: fetchDemoSubmissions,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUpdateDemoSubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "approved" | "rejected" | "contacted";
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/demo-submissions/${id}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "demo-submissions"] });
    },
  });
}
