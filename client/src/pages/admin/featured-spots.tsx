import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Music, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AddFeaturedSpotModal } from "@/components/modals/mutate-featured-modal";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { FeaturedSpot } from "@shared/schema";

export default function FeaturedSpotsAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Featured Artist Spots
              </h1>
              <p className="text-gray-400">
                Manage homepage carousel featured artists
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin">← Back to Dashboard</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => setIsModalOpen(true)}
              >
                + Add Featured Artist
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <FeaturedSpotsList />
      </div>
      <AddFeaturedSpotModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}

function FeaturedSpotsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSpot, setEditingSpot] = useState<FeaturedSpot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSpot, setDeletingSpot] =
    useState<Partial<FeaturedSpot> | null>(null);

  const { data: spots, isLoading } = useQuery({
    queryKey: ["/api/admin/featured-spots"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/featured-spots");
      if (!response.ok) throw new Error("Failed to fetch featured spots");
      return response.json();
    },
  });

  const { mutate: deleteSpot, isPending } = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/featured-spots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/featured-spots"],
      });
      toast({ title: "Featured spot deleted successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting featured spot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return apiRequest(
        "PUT",
        `/api/admin/featured-spots/${data.id}`,
        data.updates
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/featured-spots"],
      });
      toast({ title: "Featured spot updated successfully!" });
      setIsEditDialogOpen(false);
      setEditingSpot(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating featured spot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (spot: any) => {
    setEditingSpot(spot);
    setDeletingSpot(null);
    setIsEditDialogOpen(true);
  };

  // const handleDelete = (spot: any) => {
  //   if (confirm(`Are you sure you want to delete "${spot.title}"?`)) {
  //     deleteSpot.mutate(spot.id);
  //   }
  // };

  async function handleDelete(id: string) {
    deleteSpot(id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingSpot(null);
      },
      onError: () => {
        alert("Error deleting spot.");
      },
    });
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSpot) return;

    const formData = new FormData(e.currentTarget);
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      videoUrl: formData.get("videoUrl") as string,
      buttonText: formData.get("buttonText") as string,
      buttonUrl: formData.get("buttonUrl") as string,
      priceUSD: parseFloat(formData.get("priceUSD") as string),
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      status: formData.get("status") === "on" ? "active" : "pending",
    };

    updateMutation.mutate({ id: editingSpot.id, updates });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Music className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No featured spots configured yet
            </h3>
            <p>
              Create your first featured artist placement to showcase artists on
              the homepage carousel.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {spots.map((spot: any) => (
          <Card key={spot.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {spot.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{spot.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Artist: {spot.artist?.username || "Unknown"}</span>
                      <span>Price: ${spot.priceUSD}</span>
                      <Badge
                        variant={
                          spot.status === "active" ? "default" : "secondary"
                        }
                        className={
                          spot.status === "active"
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }
                      >
                        {spot.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    onClick={() => handleEdit(spot)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      setDeletingSpot(spot);
                      setDeleteOpen(true);
                    }}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Featured Spot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Edit Featured Spot
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the carousel slide details below
            </DialogDescription>
          </DialogHeader>

          {editingSpot && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingSpot.title}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceUSD" className="text-gray-300">
                    Price (USD)
                  </Label>
                  <Input
                    id="priceUSD"
                    name="priceUSD"
                    type="number"
                    step="0.01"
                    defaultValue={editingSpot.priceUSD}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingSpot.description ?? ""}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl" className="text-gray-300">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={editingSpot.imageUrl || ""}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl" className="text-gray-300">
                    Video URL (optional)
                  </Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    defaultValue={editingSpot.videoUrl || ""}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buttonText" className="text-gray-300">
                    Button Text
                  </Label>
                  <Input
                    id="buttonText"
                    name="buttonText"
                    defaultValue={editingSpot.buttonText || "View Profile"}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonUrl" className="text-gray-300">
                    Button URL
                  </Label>
                  <Input
                    id="buttonUrl"
                    name="buttonUrl"
                    defaultValue={editingSpot.buttonUrl || ""}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="/profile/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-300">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    defaultValue={
                      editingSpot.startDate
                        ? new Date(editingSpot.startDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-gray-300">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    defaultValue={
                      editingSpot.endDate
                        ? new Date(editingSpot.endDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
                <div>
                  <Label htmlFor="status" className="text-gray-300">
                    Active
                  </Label>
                  <p className="text-xs text-gray-400">
                    Toggle to set whether this featured spot is active or
                    inactive.
                  </p>
                </div>
                <Switch
                  id="status"
                  name="status"
                  defaultChecked={editingSpot.status === "active"}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {updateMutation.isPending
                    ? "Updating..."
                    : "Update Featured Spot"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Spot"
        description={
          <>
            Are you sure you want to delete the spot{" "}
            <strong>{deletingSpot?.title || "Untitled"}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (deletingSpot?.id) {
            handleDelete(deletingSpot.id);
          }
        }}
        isPending={isPending}
      />
    </>
  );
}
