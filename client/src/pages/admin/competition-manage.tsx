import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  BarChart3,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { useDemoSubmissions } from "@/api/hooks/admin/useDemoSubmissions";
import { cn } from "@/lib/utils";

export default function CompetitionManageAdmin() {
  const [, params] = useRoute("/admin/competitions/:id/manage");
  const id = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  const { data: competition, isLoading } = useQuery({
    queryKey: ["/api/admin/competitions", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/competitions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["/api/admin/competitions", id, "entries"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admin/competitions/${id}/entries`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("PUT", `/api/admin/competitions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/competitions", id],
      });
      toast({ title: "Updated!" });
    },
  });

  if (isLoading || !competition) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-400 mb-2"
          >
            <Link href="/admin/competitions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">{competition.name}</h1>
          <p className="text-gray-400">{competition.city}</p>
        </div>
      </div>

      <div className="p-6 max-w-4xl space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Show vote count</CardTitle>
                <p className="text-gray-400 text-sm">
                  Display vote counts on the public voting page
                </p>
              </div>
              <Button
                variant={
                  competition.showVoteCount !== false ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  updateMutation.mutate({
                    showVoteCount: competition.showVoteCount === false,
                  })
                }
              >
                {competition.showVoteCount !== false ? "On" : "Off"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Finalist entries</CardTitle>
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-purple-500"
                >
                  <Link href={`/admin/competitions/${id}/votes`}>
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View votes
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  <a
                    href={`/voting/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </a>
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600"
                  onClick={() => setIsAddEntryOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add entry
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No entries yet. Add finalist videos.
              </p>
            ) : (
              <div className="space-y-3">
                {entries.map((e: any) => (
                  <EntryRow key={e.id} entry={e} competitionId={id!} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddEntryDialog
        open={isAddEntryOpen}
        onOpenChange={setIsAddEntryOpen}
        competitionId={id!}
      />
    </div>
  );
}

function EntryRow({
  entry,
  competitionId,
}: {
  entry: any;
  competitionId: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest(
        "DELETE",
        `/api/admin/competitions/${competitionId}/entries/${entry.id}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/competitions", competitionId, "entries"],
      });
      toast({ title: "Entry deleted" });
      setDeleteOpen(false);
    },
  });

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div>
        <p className="font-medium text-white">{entry.songTitle}</p>
        <p className="text-gray-400 text-sm">
          {entry.artist?.fullName || entry.artist?.username} •{" "}
          {entry.artistCity || "—"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-400 hover:bg-red-500/20"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete entry"
        description="Are you sure? This cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

function AddEntryDialog({
  open,
  onOpenChange,
  competitionId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  competitionId: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [artistId, setArtistId] = useState<string>("");
  const [artistOpen, setArtistOpen] = useState(false);

  const { data: demoSubmissions = [], isLoading: loadingArtists } =
    useDemoSubmissions();

  // Dedupe by userId - artists who have submitted demos
  const demoArtists = Array.from(
    new Map(
      demoSubmissions.map((s) => [
        s.userId,
        {
          id: s.userId,
          fullName: s.user?.fullName,
          username: s.user?.username,
          email: s.user?.email,
          displayName:
            s.user?.fullName || s.user?.username || s.user?.email || "Unknown",
        },
      ]),
    ).values(),
  ).sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

  const selectedArtist = demoArtists.find((a) => a.id === artistId);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "POST",
        `/api/admin/competitions/${competitionId}/entries`,
        data,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/competitions", competitionId, "entries"],
      });
      toast({ title: "Entry added!" });
      onOpenChange(false);
      setArtistId("");
    },
    onError: (e: any) => {
      toast({
        title: "Failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!artistId) {
      toast({
        title: "Select an artist",
        description: "Choose an artist who has submitted a demo.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      artistId,
      videoUrl: (form.elements.namedItem("videoUrl") as HTMLInputElement).value,
      songTitle: (form.elements.namedItem("songTitle") as HTMLInputElement)
        .value,
      artistCity: (form.elements.namedItem("artistCity") as HTMLInputElement)
        .value,
      shortDescription: (
        form.elements.namedItem("shortDescription") as HTMLTextAreaElement
      ).value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add finalist entry</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a video entry. Choose an artist who has submitted a demo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Artist</Label>
            <Popover open={artistOpen} onOpenChange={setArtistOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={artistOpen}
                  className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  {selectedArtist ? (
                    <span>
                      {selectedArtist.displayName}
                      {selectedArtist.username && (
                        <span className="text-gray-500 ml-2">
                          @{selectedArtist.username}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {loadingArtists
                        ? "Loading..."
                        : "Search artists who submitted demos..."}
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-900 border-gray-700"
                align="start"
              >
                <Command className="bg-gray-900">
                  <CommandInput
                    placeholder="Search by name or username..."
                    className="text-white"
                  />
                  <CommandEmpty>
                    No artists found. Artists appear here after they submit a
                    demo.
                  </CommandEmpty>
                  <CommandGroup>
                    {demoArtists.map((artist) => (
                      <CommandItem
                        key={artist.id}
                        value={`${artist.displayName} ${artist.username || ""} ${artist.email || ""}`}
                        onSelect={() => {
                          setArtistId(artist.id);
                          setArtistOpen(false);
                        }}
                        className="text-white focus:bg-gray-800"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            artistId === artist.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div>
                          <span>{artist.displayName}</span>
                          {artist.username && (
                            <span className="text-gray-500 ml-2">
                              @{artist.username}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Video URL</Label>
            <Input
              name="videoUrl"
              required
              className="bg-gray-800 border-gray-600"
              placeholder="https://youtube.com/... or https://vimeo.com/..."
            />
          </div>
          <div>
            <Label>Song title</Label>
            <Input
              name="songTitle"
              required
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label>Artist city</Label>
            <Input
              name="artistCity"
              className="bg-gray-800 border-gray-600"
              placeholder="e.g. London"
            />
          </div>
          <div>
            <Label>Short description</Label>
            <Textarea
              name="shortDescription"
              className="bg-gray-800 border-gray-600"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Add entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
