"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "../ui/multi-select";
import { DateTimePicker } from "../ui/date-time-picker";
import { useAllUsers } from "@/api/hooks/users/useAllUsers";
import {
  useCreateBroadcast,
  useUpdateBroadcast,
} from "@/api/hooks/broadcasts/useMutateBroadcast";
import {
  AdminBroadcast,
  InsertAdminBroadcast,
  insertAdminBroadcastSchema,
  User,
} from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/provider/use-auth";
import { useEffect } from "react";
import { X } from "lucide-react";

// ✅ Extended schema with stricter rules
const extendedSchema = insertAdminBroadcastSchema
  .extend({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    targetAudience: z.enum([
      "all",
      "artists",
      "fans",
      "subscribers",
      "specific",
    ]),
    specificUserIds: z.array(z.string()).nullable(),
    scheduledFor: z
      .union([z.string().datetime(), z.null()])
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.targetAudience === "specific") {
        return data.specificUserIds && data.specificUserIds.length > 0;
      }
      return true;
    },
    {
      message: "You must select at least one user",
      path: ["specificUserIds"],
    }
  )
  .refine(
    (data) => {
      if (data.scheduledFor) {
        return new Date(data.scheduledFor) > new Date();
      }
      return true;
    },
    {
      message: "Scheduled date must be in the future",
      path: ["scheduledFor"],
    }
  );

interface BroadcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBroadcast: AdminBroadcast | null;
  setEditingBroadcast: (broadcast: AdminBroadcast | null) => void;
}

export default function BroadcastModal({
  open,
  onOpenChange,
  editingBroadcast,
  setEditingBroadcast,
}: BroadcastModalProps) {
  const { user } = useAuth();
  const { data: usersData, isLoading } = useAllUsers();

  const { mutate: createBroadcast, isPending: isCreating } =
    useCreateBroadcast();
  const { mutate: updateBroadcast, isPending: isUpdating } =
    useUpdateBroadcast();

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<InsertAdminBroadcast>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "notification",
      targetAudience: "all",
      specificUserIds: [],
      scheduledFor: null,
      createdBy: user?.id || "",
    },
  });

  // 👇 This ensures values get populated correctly
  useEffect(() => {
    if (editingBroadcast) {
      reset({
        title: editingBroadcast.title,
        message: editingBroadcast.message,
        type: editingBroadcast.type,
        targetAudience: editingBroadcast.targetAudience,
        specificUserIds: editingBroadcast.specificUserIds ?? [],
        scheduledFor: editingBroadcast.scheduledFor,
        createdBy: user?.id || "",
      });
    } else {
      reset({
        title: "",
        message: "",
        type: "notification",
        targetAudience: "all",
        specificUserIds: [],
        scheduledFor: null,
        createdBy: user?.id || "",
      });
    }
  }, [editingBroadcast, reset, usersData?.users, user?.id]);

  const onSubmit = (data: InsertAdminBroadcast) => {
    if (!user?.id) return;
    if (editingBroadcast) {
      updateBroadcast(
        {
          id: editingBroadcast.id,
          data: {
            ...data,
            status: getValues("scheduledFor") ? "scheduled" : "draft",
          },
        },
        {
          onSuccess: () => {
            // onOpenChange(false);
            setEditingBroadcast(null);
          },
        }
      );
    } else {
      createBroadcast(
        {
          ...data,
          createdBy: user?.id,
          status: getValues("scheduledFor") ? "scheduled" : "draft",
        },
        {
          onSuccess: () => {
            // onOpenChange(false);
            setEditingBroadcast(null);
          },
        }
      );
    }
  };

  const handleResetScheduledDate = () => {
    setValue("scheduledFor", null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setEditingBroadcast(null);
      }}
    >
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingBroadcast ? "Edit Broadcast" : "Create New Broadcast"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send targeted notifications and emails to user groups
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Broadcast title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your message to users..."
              rows={4}
              {...register("message")}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Type & Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Delivery Method</Label>
              <Select
                value={watch("type")}
                onValueChange={(val) =>
                  setValue("type", val as AdminBroadcast["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">
                    In-App Notification Only
                  </SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="both">
                    Both Notification & Email
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select
                value={watch("targetAudience")}
                onValueChange={(val) =>
                  setValue(
                    "targetAudience",
                    val as AdminBroadcast["targetAudience"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="artists">Artists Only</SelectItem>
                  <SelectItem value="fans">Fans Only</SelectItem>
                  <SelectItem value="subscribers">Subscribers Only</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
              {errors.targetAudience && (
                <p className="text-sm text-red-500">
                  {errors.targetAudience.message}
                </p>
              )}
            </div>
          </div>

          {!isLoading && watch("targetAudience") === "specific" && (
            <div className="space-y-2">
              <Label>Select Users</Label>
              <MultiSelect
                options={
                  usersData?.users?.map((u) => ({
                    label: `@${u.username} (${u.role})`,
                    value: u.id,
                  })) || []
                }
                value={(watch("specificUserIds") as readonly string[]) ?? []}
                onValueChange={(val) => setValue("specificUserIds", val)}
                placeholder="Select users..."
              />
              {errors.specificUserIds && (
                <p className="text-sm text-red-500">
                  {errors.specificUserIds.message}
                </p>
              )}
            </div>
          )}

          {/* Schedule - Updated with Reset Button */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Schedule For (Optional)</Label>
                {watch("scheduledFor") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetScheduledDate}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <DateTimePicker
                showTimePicker
                value={
                  watch("scheduledFor")
                    ? new Date(watch("scheduledFor") as string)
                    : null
                }
                onChange={(val) =>
                  setValue("scheduledFor", val ? val.toISOString() : null)
                }
              />
              {errors.scheduledFor && (
                <p className="text-sm text-red-500">
                  {errors.scheduledFor.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {editingBroadcast
                ? isUpdating
                  ? "Updating..."
                  : "Update Broadcast"
                : isCreating
                ? "Creating..."
                : "Create Broadcast"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
