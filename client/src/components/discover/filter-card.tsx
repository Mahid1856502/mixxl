import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { GENRES, MOODS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";

type FiltersParams = {
  search: string;
  genre: string;
  mood: string;
  sort: string;
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alphabetical", label: "A-Z" },
];

export default function FiltersCard({
  params,
  setParams,
  refetch,
}: {
  params: FiltersParams;
  setParams: (p: Partial<FiltersParams>) => void;
  refetch?: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(params.search);
  const debouncedSearch = useDebounce(localSearch, 500); // 500ms debounce

  useEffect(() => {
    setParams({ search: debouncedSearch });
  }, [debouncedSearch]);

  const handleClear = () => {
    setParams({
      sort: "newest",
      genre: "all",
      mood: "all",
      search: "",
    }); // clears all query params (defaults still applied by hook)
    refetch?.();
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search for tracks, artists, or genres..."
              className="pl-10 bg-white/5 border-white/10 h-12 text-lg"
            />
          </div>

          {/* Genres + Filter toggle */}
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={params.genre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setParams({ genre })}
                  className={
                    params.genre === genre ? "mixxl-gradient text-white" : ""
                  }
                >
                  {genre}
                </Button>
              ))}
            </div>
            <Button
              size="icon"
              className="px-3"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Extra filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
              {/* Mood */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mood</label>
                <Select
                  value={params.mood}
                  onValueChange={(mood) => setParams({ mood })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Moods
                    </SelectItem>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sort By
                </label>
                <Select
                  value={params.sort}
                  onValueChange={(sort) => setParams({ sort })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
