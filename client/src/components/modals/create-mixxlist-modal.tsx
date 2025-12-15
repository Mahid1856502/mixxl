import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/provider/use-auth";
import { List, Plus, Loader2 } from "lucide-react";

interface CreateMixxlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateMixxlistModal({
  open,
  onOpenChange,
}: CreateMixxlistModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Create mixxlist mutation
  const createMutation = useMutation({
    mutationFn: async (mixxlistData: {
      name: string;
      description?: string;
    }) => {
      const response = await apiRequest("POST", "/api/mixxlists", mixxlistData);
      return response.json();
    },
    onSuccess: (newMixxlist) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "mixxlists"],
      });
      toast({
        title: "Mixxlist Created!",
        description: `"${newMixxlist.name}" has been added to your collection.`,
      });
      onOpenChange(false);
      setName("");
      setDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description:
          error.message || "Failed to create Mixxlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your Mixxlist.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <List className="w-5 h-5 mr-2" />
            Create New Mixxlist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Mixxlist Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Indie Collection, Chill Vibes, etc."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500"
              maxLength={100}
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-gray-400">
              Choose a name that describes the style or mood of this collection
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what kind of tracks you'll collect in this Mixxlist..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none focus:bg-gray-700 focus:border-gray-500"
              rows={3}
              maxLength={500}
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-gray-400">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Mixxlist
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
