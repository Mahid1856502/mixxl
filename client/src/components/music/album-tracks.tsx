"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GripVertical, X } from "lucide-react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Track } from "@shared/schema";
import { FieldErrors } from "react-hook-form";
import { Skeleton } from "../ui/skeleton";

function formatDuration(sec?: number) {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SortableTrackCard({
  track,
  onRemove,
}: {
  track: Track;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-3 flex items-center justify-between gap-4">
        {/* Drag handle only */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-2 text-muted-foreground"
        >
          <GripVertical size={16} />
        </div>

        {/* Track details */}
        <div className="flex items-center gap-3 flex-1">
          {track.coverImage ? (
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-md" />
          )}
          <div>
            <p className="font-medium">{track.title}</p>
            <p className="text-xs text-muted-foreground">
              {track.genre || "Unknown"} · {track.mood || "—"} ·{" "}
              {formatDuration(track.duration ?? undefined)}
            </p>
          </div>
        </div>

        {/* Remove button */}
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(track.id)}
        >
          <X />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AlbumTracks({
  errors,
  userTracks,
  tracksLoading = false,
  fields,
  append,
  remove,
  move,
}: {
  errors: FieldErrors;
  userTracks: Track[];
  fields: { id: string; trackId: string; trackNumber: number }[];
  append: (track: { trackId: string; trackNumber: number }) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  tracksLoading?: boolean;
}) {
  const [search, setSearch] = useState("");

  // Only show tracks not already in the form
  const availableTracks = useMemo(
    () =>
      userTracks
        .filter((t) => !fields.some((f) => f.trackId === t.id))
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [userTracks, fields, search]
  );

  const addTrack = (track: Track) => {
    append({ trackId: track.id, trackNumber: fields.length + 1 });
  };

  const removeTrack = (trackId: string) => {
    const index = fields.findIndex((f) => f.trackId === trackId);
    if (index !== -1) remove(index);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.trackId === active.id);
      const newIndex = fields.findIndex((f) => f.trackId === over?.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracks</CardTitle>
        <CardDescription>Add tracks</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available tracks */}
        <div>
          <Label>Available tracks</Label>
          <Input
            placeholder="Search tracks..."
            className="my-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={tracksLoading}
          />

          <div className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded-md">
            {tracksLoading
              ? // skeleton list for available tracks
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-md"
                  >
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              : availableTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-800"
                    onClick={() => addTrack(track)}
                  >
                    <img
                      src={track.coverImage ?? ""}
                      alt={track.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{track.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {track.genre || "Unknown"} · {track.mood || "—"}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Album track list with DnD */}
        <div>
          <div className="font-medium mb-2">Album track list</div>
          {fields.length === 0 && !tracksLoading && (
            <p className="text-sm text-muted-foreground">No tracks added yet</p>
          )}
          {fields.length < 1 && errors.tracks && !tracksLoading && (
            <p className="text-sm text-red-500 mt-3">
              {String(errors.tracks?.message)}
            </p>
          )}

          {tracksLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-4">
                    <Skeleton className="w-4 h-4" />{" "}
                    {/* drag handle placeholder */}
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-md" />{" "}
                    {/* remove btn */}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.trackId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {fields.map((f, index) => {
                    const track = userTracks.find((t) => t.id === f.trackId);
                    if (!track) return null;
                    return (
                      <SortableTrackCard
                        key={f.trackId}
                        track={track}
                        onRemove={() => removeTrack(f.trackId)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
