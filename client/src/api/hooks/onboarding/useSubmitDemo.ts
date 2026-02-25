import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type SubmitDemoPayload = {
  account: {
    artistName: string;
    realName: string;
    email: string;
    password: string;
  };
  tracks: {
    id: string;
    title: string;
    fileUrl: string;
  }[];
  artistSocials?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    soundcloud?: string;
  };
  message?: string;
  final: {
    agreedToTerms: boolean;
    subscribedToNewsletter: boolean;
  };
};

export type SubmitDemoResponse = {
  message: string;
  user: { id: string; email?: string; [key: string]: unknown };
  token: string;
};

export function useSubmitDemo(options?: {
  onSuccess?: (data: SubmitDemoResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<SubmitDemoResponse, Error, SubmitDemoPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/demo-submission", payload);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user?.id);
        localStorage.setItem("email", data.user?.email);
      }
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
