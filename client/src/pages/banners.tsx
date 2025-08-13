"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { BannerMutateModal } from "@/components/modals/mutate-banner-modal";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { Banner } from "@shared/schema";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteBanner } from "@/api/hooks/banners/useDeleteBanner";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";

export default function ManageBannersPage() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Partial<Banner> | null>(
    null
  );

  const {
    data: banners = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/my/banners"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/my/banners");
      return response.json();
    },
  });

  // Use mutation hook
  const { mutate: deleteBanner, isPending } = useDeleteBanner();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Access Denied – Admins only
      </div>
    );
  }

  async function handleDelete(id: string) {
    deleteBanner(id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedBanner(null);
      },
      onError: () => {
        alert("Error deleting banner.");
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Banners</h1>
          <p className="text-gray-400 text-sm">
            View and manage all advertising banners
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBanner(null);
            setEditOpen(true);
          }}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Banner
        </Button>
      </div>

      {/* Status messages */}
      {isLoading && <div className="text-white">Loading banners...</div>}
      {isError && <div className="text-red-500">Failed to load banners.</div>}
      {!isLoading && !isError && banners.length === 0 && (
        <div className="text-gray-400">No banners found.</div>
      )}

      {/* Banner list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner: Banner) => (
          <Card key={banner.id} className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle>
                <h2 className="text-white text-lg">
                  {banner.title || "Untitled Banner"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {banner.description || "No description"}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              {banner.imageUrl && (
                <img
                  src={`${BASE_URL}${banner.imageUrl}`}
                  alt="Banner"
                  className="rounded w-full h-32 object-cover"
                />
              )}
              <div className="text-sm">
                <span className="font-semibold">Status:</span>{" "}
                {banner.active ? (
                  <span className="text-green-400">Active</span>
                ) : (
                  <span className="text-red-400">Inactive</span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                {/* Edit button */}
                <Button
                  variant="outline"
                  className="text-purple-400 border-purple-500 hover:bg-purple-500/10"
                  onClick={() => {
                    setSelectedBanner(banner);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                {/* Delete button */}
                <Button
                  variant="destructive"
                  className="text-white"
                  onClick={() => {
                    setSelectedBanner(banner);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Banner Modal */}
      <BannerMutateModal
        open={editOpen}
        setOpen={setEditOpen}
        bannerToEdit={selectedBanner}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Banner"
        description={
          <>
            Are you sure you want to delete the banner{" "}
            <strong>{selectedBanner?.title || "Untitled"}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (selectedBanner?.id) {
            handleDelete(selectedBanner.id);
          }
        }}
        isPending={isPending}
      />
    </div>
  );
}
