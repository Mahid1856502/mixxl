"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertAlbum, UpdateAlbum, Album, AlbumExtended } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// ----------------- API functions -----------------
async function fetchAlbum(id?: string): Promise<AlbumExtended | null> {
  const res = await apiRequest("GET", `/api/albums/${id}`);
  if (!res.ok) throw new Error("Failed to fetch album");
  return res.json();
}

async function createAlbum(data: InsertAlbum): Promise<Album> {
  const res = await apiRequest("POST", `/api/albums`, data);
  if (!res.ok) throw new Error("Failed to create album");
  return res.json();
}

async function updateAlbum({
  id,
  data,
}: {
  id: string;
  data: UpdateAlbum;
}): Promise<Album> {
  const res = await apiRequest("PATCH", `/api/albums/${id}`, data);
  if (!res.ok) throw new Error("Failed to update album");
  return res.json();
}

async function deleteAlbum(id: string): Promise<void> {
  const res = await apiRequest("DELETE", `/api/albums/${id}`);
  if (!res.ok) throw new Error("Failed to delete album");
  return res.json();
}

// optional: fetch albums by artist or all public
async function fetchAlbums(artistId?: string): Promise<AlbumExtended[]> {
  const url = `/api/albums/artist/${artistId}`;
  const res = await apiRequest("GET", url);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

async function fetchMyAlbums(): Promise<AlbumExtended[]> {
  const res = await apiRequest("GET", `/api/albums/buyer`);
  if (!res.ok) throw new Error("Failed to fetch my albums");
  return res.json();
}

async function fetchAllAlbums(): Promise<Album[]> {
  const url = `/api/albums`;
  const res = await apiRequest("GET", url);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

// ----------------- React Query Hooks -----------------
export function useAlbum(id?: string) {
  return useQuery({
    queryKey: ["albums", id],
    queryFn: () => fetchAlbum(id),
    enabled: !!id,
  });
}

export function useMyAlbums({ enabled }: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["my-albums"],
    queryFn: () => fetchMyAlbums(),
    enabled,
  });
}

export function useAllAlbums({ enable }: { enable?: boolean }) {
  return useQuery({
    queryKey: ["albums"],
    queryFn: () => fetchAllAlbums(),
    enabled: !!enable,
  });
}

export function useAlbums({
  enabled,
  artistId,
}: {
  enabled?: boolean;
  artistId?: string;
}) {
  return useQuery({
    queryKey: artistId ? ["albums", "artist", artistId] : ["albums"],
    queryFn: () => fetchAlbums(artistId),
    enabled: !!artistId && enabled,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlbum,
    onSuccess: (newAlbum) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.setQueryData(["albums", newAlbum.id], newAlbum);
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlbum,
    onSuccess: (updatedAlbum) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.setQueryData(["albums", updatedAlbum.id], updatedAlbum);
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.removeQueries({ queryKey: ["albums", id] });
    },
  });
}
