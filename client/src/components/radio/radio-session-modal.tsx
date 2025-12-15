"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

import { z } from "zod";
import {
  useCreateRadioSession,
  useUpdateRadioSession,
} from "@/api/hooks/radio/useRadioSession";
import { useEffect } from "react";
import { useAuth } from "@/provider/use-auth";
import { RadioSession } from "@shared/schema";

// Zod schema for validation
const radioSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  hostId: z.string().uuid("Invalid host ID"),
  startTime: z.string().min(1, "Start time is required"), // HH:mm
  duration: z.number().min(1, "Duration is required"), // in minutes
});

type RadioSessionForm = z.infer<typeof radioSessionSchema>;

interface RadioSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: RadioSession | null;
  selectedDate?: Date | null; // the day of the session
}

export function RadioSessionModal({
  open,
  onOpenChange,
  session,
  selectedDate,
}: RadioSessionModalProps) {
  const { user } = useAuth();
  const isEditMode = Boolean(session);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RadioSessionForm>({
    resolver: zodResolver(radioSessionSchema),
    defaultValues: {
      title: session?.title ?? "",
      description: session?.description ?? "",
      hostId: session?.hostId ?? user?.id ?? "",
      startTime: session?.scheduledStart
        ? new Date(session.scheduledStart).toTimeString().slice(0, 5)
        : selectedDate
        ? new Date(selectedDate).toTimeString().slice(0, 5)
        : "", // no fallback 09:00
      duration:
        session?.scheduledStart && session?.scheduledEnd
          ? (new Date(session.scheduledEnd).getTime() -
              new Date(session.scheduledStart).getTime()) /
            60000
          : 60,
    },
  });

  const { mutate: createSession, isPending: isCreating } =
    useCreateRadioSession();
  const { mutate: updateSession, isPending: isUpdating } =
    useUpdateRadioSession();

  useEffect(() => {
    if (session?.scheduledStart) {
      reset({
        title: session.title ?? "",
        description: session.description ?? "",
        hostId: session.hostId ?? user?.id ?? "",
        startTime: new Date(session.scheduledStart).toTimeString().slice(0, 5),
        duration:
          session.scheduledEnd && session.scheduledStart
            ? (new Date(session.scheduledEnd).getTime() -
                new Date(session.scheduledStart).getTime()) /
              60000
            : 60,
      });
    } else if (selectedDate) {
      reset({
        title: "",
        description: "",
        hostId: user?.id ?? "",
        startTime: new Date(selectedDate).toTimeString().slice(0, 5),
        duration: 60,
      });
    } else {
      reset();
    }
    // Only run this effect when session changes or user id changes
  }, [session, reset, user?.id]);

  const onSubmit = (data: RadioSessionForm) => {
    if (!user || !selectedDate) return;

    const [hours, minutes] = data.startTime.split(":").map(Number);
    const scheduledStart = new Date(selectedDate);
    scheduledStart.setHours(hours, minutes, 0, 0);

    const scheduledEnd = new Date(
      scheduledStart.getTime() + data.duration * 60000
    );

    const payload = {
      ...data,
      scheduledStart,
      scheduledEnd,
      hostId: user.id,
      description: data.description ?? null,
    };

    if (isEditMode && session?.id) {
      updateSession(
        {
          ...payload,
          id: session.id,
          actualStart: null,
          actualEnd: null,
          createdAt: null,
          radioCoStreamId: null,
          isLive: null,
          listenerCount: null,
          currentTrackId: null,
        },
        {
          onSuccess: () => {
            toast({ title: "Session updated successfully" });
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast({
              title: "Failed to update session",
              description: err?.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createSession(payload, {
        onSuccess: () => {
          toast({ title: "Session created successfully" });
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create session",
            description: err?.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl sm:mx-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Radio Session" : "Create Radio Session"}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to {isEditMode ? "update" : "create"} a
            radio session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Session title"
              {...register("title")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Session description"
              {...register("description")}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            {/* Start Time */}
            <div className="flex-1 flex flex-col space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                step="10"
                {...register("startTime")}
                disabled={isPending}
              />
              {errors.startTime && (
                <p className="text-red-600 text-sm">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="flex-1 flex flex-col space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                {...register("duration", { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.duration && (
                <p className="text-red-600 text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Session"
                : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
