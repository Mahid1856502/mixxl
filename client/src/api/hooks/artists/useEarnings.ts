// src/hooks/useArtistTransactions.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PaymentStatus, TrackExtended } from "@shared/schema";

export interface ArtistBalance {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
}

export interface ArtistTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string; // "charge" | "payout" | "refund" | etc.
  description: string | null;
  net: number;
  fee: number;
  status: string;
  createdAt: string; // ISO string
}

export interface ArtistPayout {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | string;
  method: string;
  arrivalDate: string; // ISO string
  createdAt: string; // ISO string
}

export interface PurchasedTrack extends TrackExtended {
  purchaseStatus: PaymentStatus;
  purchasedAt: string; // ISO date
  buyerId: string;
}

export interface ArtistTransactionsResponse {
  balance: ArtistBalance;
  transactions: ArtistTransaction[];
  payouts: ArtistPayout[];
  localPurchases: PurchasedTrack[];
}

async function fetchArtistTransactions(): Promise<ArtistTransactionsResponse> {
  const res = await apiRequest("POST", "/api/artist/transactions");

  if (!res.ok) {
    throw new Error("Failed to fetch artist transactions");
  }

  return res.json();
}

export function useArtistTransactions() {
  return useQuery<ArtistTransactionsResponse>({
    queryKey: ["artistTransactions"],
    queryFn: fetchArtistTransactions,
  });
}
