import { ChangeEvent } from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Upload, GripVertical, X, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useDemoUploadFile } from "@/api/hooks/s3/useDemoUploadFile";

// --------------------
// Types
// --------------------

export type TrackItem = {
  id: string;
  title: string;
  fileUrl: string;
};

type TracksFormValues = {
  tracks: TrackItem[];
};

type Props = {
  form: UseFormReturn<TracksFormValues>;
};

// --------------------
// Sortable Item
// --------------------

function SortableTrack({
  track,
  onRename,
  onRemove,
}: {
  track: TrackItem;
  onRename: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <Input
          value={track.title}
          onChange={(e) => onRename(track.id, e.target.value)}
          className="bg-transparent border-white/10"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(track.id)}
        className="ml-3 text-muted-foreground hover:text-red-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// --------------------
// Main Component
// --------------------

export default function TrackUploadStep({ form }: Props) {
  const tracks = form.watch("tracks") ?? [];
  const { uploadFile, isUploading } = useDemoUploadFile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  // --------------------
  // File Upload (upload to S3, store fileUrl)
  // --------------------

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existing = form.getValues("tracks") ?? [];

    if (existing.length + files.length > 5) {
      return;
    }

    const newTracks: TrackItem[] = [];
    for (const file of files) {
      const fileUrl = await uploadFile(file);
      newTracks.push({
        id: nanoid(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileUrl,
      });
    }

    form.setValue("tracks", [...existing, ...newTracks], {
      shouldValidate: true,
    });

    e.target.value = ""; // reset input
  };

  // --------------------
  // Drag Reorder
  // --------------------

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);

    const updated = [...tracks];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    form.setValue("tracks", updated, { shouldValidate: true });
  };

  // --------------------
  // Rename
  // --------------------

  const handleRename = (id: string, value: string) => {
    const updated = tracks.map((t) =>
      t.id === id ? { ...t, title: value } : t,
    );
    form.setValue("tracks", updated, { shouldValidate: true });
  };

  // --------------------
  // Remove
  // --------------------

  const handleRemove = (id: string) => {
    const updated = tracks.filter((t) => t.id !== id);
    form.setValue("tracks", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold">Upload Your Music</h2>
        <p className="text-muted-foreground">
          Select up to 5 tracks and arrange them by priority for review
        </p>
      </div>

      <Input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFiles}
        disabled={isUploading}
        className="bg-white/5 border-white/10"
      />
      {isUploading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tracks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tracks.map((track) => (
              <SortableTrack
                key={track.id}
                track={track}
                onRename={handleRename}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-muted-foreground text-center">
        Top track = highest priority for A&R listening
      </p>
    </div>
  );
}
