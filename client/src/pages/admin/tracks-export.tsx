import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ArrowLeft, Loader2, Music, FileArchive, Search } from "lucide-react";
import { useAuth } from "@/provider/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BASE_URL } from "@/lib/queryClient";

type TrackRow = {
  trackId: string;
  trackTitle: string;
  trackDescription?: string;
  genre?: string;
  mood?: string;
  duration?: number;
  fileUrl?: string;
  coverImage?: string;
  artistId: string;
  artistUsername?: string;
  artistFullName?: string;
};

export default function TracksExportAdmin() {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tracks = [], isLoading } = useQuery<TrackRow[]>({
    queryKey: ["admin", "tracks-list"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/tracks/list");
      return res.json();
    },
    enabled: !!user && user.role === "admin",
  });

  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.trackTitle || "").toLowerCase().includes(q) ||
      (t.artistUsername || "").toLowerCase().includes(q) ||
      (t.artistFullName || "").toLowerCase().includes(q)
    );
  });

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredTracks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTracks.map((t) => t.trackId)));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const res = await apiRequest("GET", "/api/admin/tracks/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracks-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    setError(null);
    try {
      const trackIds = Array.from(selectedIds);
      const res = await fetch(`${BASE_URL}/api/admin/tracks/export-zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ trackIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracks-export-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExportingZip(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white mb-2"
              >
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bulk Export Tracks
              </h1>
              <p className="text-gray-400">
                Select tracks to download as ZIP (organized by artist ID)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Music className="h-5 w-5 text-purple-400" />
              Select Tracks to Download
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose which tracks and cover images to include. The ZIP will be
              organized in folders named <code className="text-purple-400">{`{artistId}_{username}`}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by track or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                {selectedIds.size === filteredTracks.length ? "Deselect all" : "Select all"}
              </Button>
              <Button
                onClick={handleExportZip}
                disabled={isExportingZip || selectedIds.size === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isExportingZip ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileArchive className="h-4 w-4 mr-2" />
                )}
                {isExportingZip
                  ? "Preparing ZIP..."
                  : `Download selected (${selectedIds.size})`}
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV (metadata)
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="w-12 text-gray-400">Select</TableHead>
                      <TableHead className="text-gray-400">Track</TableHead>
                      <TableHead className="text-gray-400">Artist</TableHead>
                      <TableHead className="text-gray-400">Artist ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTracks.map((t) => (
                      <TableRow
                        key={t.trackId}
                        className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => toggleOne(t.trackId)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(t.trackId)}
                            onCheckedChange={() => toggleOne(t.trackId)}
                            className="border-gray-600 data-[state=checked]:bg-purple-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {t.coverImage ? (
                              <img
                                src={t.coverImage.startsWith("http") ? t.coverImage : `${BASE_URL}${t.coverImage}`}
                                alt=""
                                className="w-10 h-10 rounded object-cover bg-gray-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                                <Music className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {t.trackTitle || "Untitled"}
                              </div>
                              {t.genre && (
                                <div className="text-xs text-gray-500">{t.genre}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          @{t.artistUsername || "—"} {t.artistFullName && `(${t.artistFullName})`}
                        </TableCell>
                        <TableCell className="text-gray-500 font-mono text-sm">
                          {t.artistId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredTracks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {searchQuery ? "No tracks match your search" : "No tracks found"}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
