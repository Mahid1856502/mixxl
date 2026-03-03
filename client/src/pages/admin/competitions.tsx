import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Trophy,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  Image,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { Competition } from "@shared/schema";
import { format } from "date-fns";

const DEFAULT_PRIZE_TEXT = `£1000 cash prize (sponsored by Radio Wigwam)
Song recorded and released via Mixxl Media Records
Lifetime free Mixxl subscription`;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "accepting_demos", label: "Accepting demos" },
  { value: "voting_live", label: "Voting live" },
  { value: "closed", label: "Closed" },
] as const;

function getStatusColor(status: string) {
  switch (status) {
    case "accepting_demos":
      return "bg-green-600/20 text-green-400 border-green-500/30";
    case "voting_live":
      return "bg-amber-600/20 text-amber-400 border-amber-500/30";
    case "closed":
      return "bg-gray-600/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-purple-600/20 text-purple-400 border-purple-500/30";
  }
}

function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export default function CompetitionsAdmin() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewGrouped, setViewGrouped] = useState(true);

  const { data: competitions, isLoading } = useQuery({
    queryKey: ["/api/admin/competitions", { grouped: viewGrouped }],
    queryFn: async () => {
      const url = viewGrouped
        ? "/api/admin/competitions?grouped=true"
        : "/api/admin/competitions";
      const res = await apiRequest("GET", url);
      if (!res.ok) throw new Error("Failed to fetch competitions");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Competition Management
              </h1>
              <p className="text-gray-400">
                Create and manage city-based demo competitions
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={() => setViewGrouped(!viewGrouped)}
              >
                {viewGrouped ? "Flat view" : "Group by city"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin">← Back to Dashboard</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Competition
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewGrouped && typeof competitions === "object" && !Array.isArray(competitions) ? (
          <CompetitionsByCity grouped={competitions} onCreateClick={() => setIsCreateOpen(true)} />
        ) : (
          <CompetitionsList
            list={Array.isArray(competitions) ? competitions : []}
            onCreateClick={() => setIsCreateOpen(true)}
          />
        )}
      </div>

      <CreateCompetitionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}

function CompetitionsByCity({
  grouped,
  onCreateClick,
}: {
  grouped: Record<string, Competition[]>;
  onCreateClick: () => void;
}) {
  const cities = Object.keys(grouped).sort();
  if (cities.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No competitions yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first competition to get started.
          </p>
          <Button
            onClick={onCreateClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Competition
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {cities.map((city) => (
        <CityGroup key={city} city={city} competitions={grouped[city]} />
      ))}
    </div>
  );
}

function CityGroup({
  city,
  competitions,
}: {
  city: string;
  competitions: Competition[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <MapPin className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg text-white">{city}</CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {competitions.length} competition{competitions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {competitions.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function CompetitionsList({
  list,
  onCreateClick,
}: {
  list: Competition[];
  onCreateClick: () => void;
}) {
  if (list.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No competitions yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first competition to get started.
          </p>
          <Button
            onClick={onCreateClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Competition
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((c) => (
        <CompetitionCard key={c.id} competition={c} />
      ))}
    </div>
  );
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile: uploadBannerFile, isUploading: isBannerUploading } =
    useUploadFile();

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Competition> }) => {
      return apiRequest("PUT", `/api/admin/competitions/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      toast({ title: "Competition updated successfully!" });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating competition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/competitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      toast({ title: "Competition deleted successfully!" });
      setDeleteOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting competition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bannerUpdateMutation = useMutation({
    mutationFn: async (bannerImage: string) => {
      const res = await apiRequest("PUT", `/api/admin/competitions/${competition.id}`, {
        bannerImage,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      toast({ title: "Banner updated!" });
    },
    onError: (e: any) => {
      toast({ title: "Failed to update banner", description: e.message, variant: "destructive" });
    },
  });

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    e.target.value = "";
    try {
      const fileUrl = await uploadBannerFile(file);
      await bannerUpdateMutation.mutateAsync(fileUrl);
    } catch {
      // Error handled by useUploadFile toast
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const updates = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement).value,
      endDate: (form.elements.namedItem("endDate") as HTMLInputElement).value,
      maxFinalists: parseInt(
        (form.elements.namedItem("maxFinalists") as HTMLInputElement).value,
        10
      ),
      prizeDescription: (form.elements.namedItem("prizeDescription") as HTMLTextAreaElement)
        .value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value as
        | "draft"
        | "accepting_demos"
        | "voting_live"
        | "closed",
    };
    updateMutation.mutate({ id: competition.id, updates });
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{competition.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {competition.city}
                  </span>
                  <span>
                    {format(new Date(competition.startDate), "dd MMM yyyy")} –{" "}
                    {format(new Date(competition.endDate), "dd MMM yyyy")}
                  </span>
                  <span>Max {competition.maxFinalists} finalists</span>
                  <Badge
                    variant="outline"
                    className={getStatusColor(competition.status)}
                  >
                    {getStatusLabel(competition.status)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                asChild
              >
                <Link href={`/admin/competitions/${competition.id}/manage`}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Edit Competition
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update competition details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Banner image</Label>
              <p className="text-xs text-gray-500">Shown on the voting landing page</p>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
              <div className="flex items-center gap-4">
                {competition.bannerImage ? (
                  <img
                    src={
                      competition.bannerImage.startsWith("http")
                        ? competition.bannerImage
                        : `${BASE_URL}${competition.bannerImage}`
                    }
                    alt="Banner"
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-28 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isBannerUploading || bannerUpdateMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {competition.bannerImage ? "Replace" : "Upload"} banner
                </Button>
              </div>
            </div>
            <CompetitionFormFields competition={competition} />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Competition"
        description={
          <>
            Are you sure you want to delete <strong>{competition.name}</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate(competition.id)}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

function CreateCompetitionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/admin/competitions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      toast({ title: "Competition created successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating competition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement).value,
      endDate: (form.elements.namedItem("endDate") as HTMLInputElement).value,
      maxFinalists: parseInt(
        (form.elements.namedItem("maxFinalists") as HTMLInputElement).value,
        10
      ),
      prizeDescription:
        (form.elements.namedItem("prizeDescription") as HTMLTextAreaElement)
          .value || DEFAULT_PRIZE_TEXT,
      status: "draft",
    };
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Competition
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new city-based demo competition
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CompetitionFormFields />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createMutation.isPending ? "Creating..." : "Create Competition"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompetitionFormFields({
  competition,
}: {
  competition?: Competition;
} = {}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Competition name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={competition?.name}
            placeholder="e.g. London Demo Contest 2025"
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="city" className="text-gray-300">
            City
          </Label>
          <Input
            id="city"
            name="city"
            defaultValue={competition?.city}
            placeholder="e.g. London, Bristol"
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-gray-300">
            Start date
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="datetime-local"
            defaultValue={
              competition?.startDate
                ? new Date(competition.startDate).toISOString().slice(0, 16)
                : ""
            }
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-gray-300">
            End date
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="datetime-local"
            defaultValue={
              competition?.endDate
                ? new Date(competition.endDate).toISOString().slice(0, 16)
                : ""
            }
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxFinalists" className="text-gray-300">
            Max number of finalists
          </Label>
          <Input
            id="maxFinalists"
            name="maxFinalists"
            type="number"
            min={1}
            defaultValue={competition?.maxFinalists ?? 20}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        {competition && (
          <div>
            <Label htmlFor="status" className="text-gray-300">
              Status
            </Label>
            <select
              id="status"
              name="status"
              defaultValue={competition.status}
              className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="prizeDescription" className="text-gray-300">
          Prize description
        </Label>
        <Textarea
          id="prizeDescription"
          name="prizeDescription"
          defaultValue={competition?.prizeDescription ?? DEFAULT_PRIZE_TEXT}
          placeholder={DEFAULT_PRIZE_TEXT}
          className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
          rows={5}
        />
        <p className="text-xs text-gray-500 mt-1">
          Default: £1000 cash prize, song release via Mixxl Media Records,
          lifetime free Mixxl subscription
        </p>
      </div>
    </>
  );
}
