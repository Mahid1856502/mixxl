import { Event } from "@shared/schema";
import {
  CalendarDays,
  MapPin,
  Music,
  Users,
  Clock,
  DollarSign,
  Ticket,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "../ui/skeleton";
import { ConfirmDialog } from "../common/ConfirmPopup";
import { useState } from "react";
import { useDeleteEvent } from "@/api/hooks/events/useEvent";
import { Button } from "../ui/button";

interface EventCardProps {
  events: Event[];
  username: string;
  isOwnProfile?: boolean;
  isLoading?: boolean;
  view?: "grid" | "list";
}

const skeletonCount = 6;

const EventCard = ({
  events,
  username,
  isOwnProfile = false,
  isLoading = false,
  view = "grid",
}: EventCardProps) => {
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const [, navigate] = useLocation();

  const renderSkeleton = () =>
    Array.from({ length: skeletonCount }).map((_, i) => (
      <div
        key={i}
        className={`bg-neutral-900 rounded-2xl shadow-lg overflow-hidden animate-pulse flex flex-col justify-between ${
          view === "list" ? "flex-row h-32 sm:h-36" : ""
        }`}
      >
        {view === "grid" ? (
          <>
            <Skeleton className="w-full h-40 rounded-xl" />
            <div className="space-y-4 p-4 flex-1">
              <Skeleton className="w-3/4 h-6 rounded" />
              <Skeleton className="w-1/2 h-4 rounded" />
              <Skeleton className="w-full h-16 rounded" />
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          </>
        ) : (
          <>
            <Skeleton className="w-24 sm:w-32 h-full rounded-l-xl" />
            <div className="flex-1 space-y-2 p-4">
              <Skeleton className="w-3/4 h-6 rounded" />
              <Skeleton className="w-1/2 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>
          </>
        )}
      </div>
    ));

  const renderEvent = (event: Event) => {
    if (view === "grid") {
      return (
        <div className="bg-neutral-900 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between hover:shadow-xl transition">
          <div className="space-y-4">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
            )}

            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between">
                <h2 className="text-lg sm:text-xl font-semibold leading-tight line-clamp-2">
                  {event.title}
                </h2>
                <Music className="w-5 h-5 text-purple-400" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-neutral-400" />
                  <span>
                    {event.startDateTime
                      ? new Date(event.startDateTime).toLocaleDateString()
                      : "--"}
                  </span>
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>
                    {event.startDateTime
                      ? new Date(event.startDateTime).toLocaleTimeString()
                      : "--"}
                  </span>
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>
                    {event.venue}, {event.location}
                  </span>
                </div>
              </div>

              <p className="text-sm text-neutral-300 line-clamp-3">
                {event.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {event.genre?.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs bg-neutral-800 px-2 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 space-y-3 text-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span>
                  {event.soldCount}/{event.capacity} attending
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-base md:text-lg">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <span>{event.lowestTicketPrice}</span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant={"outline"}
                  className="flex-1 "
                  onClick={() =>
                    navigate(`/events/${username}/manage/${event.id}`)
                  }
                >
                  <Edit2 /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteEventId(event.id)}
                  className="flex-1 rounded-xl py-2 text-sm sm:text-base font-medium hover:opacity-70"
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            )}

            <Link
              href={`/events/${username}/${event.id}`}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition rounded-xl py-2 font-medium text-sm sm:text-base"
            >
              <Ticket className="w-4 h-4" />
              View Event Details
            </Link>
          </div>
          {deleteEventId && (
            <ConfirmDialog
              open={deleteEventId === event.id}
              onOpenChange={() => setDeleteEventId(null)}
              title="Delete Track"
              description={
                <>
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>{event?.title || "Untitled"}</strong>? This action
                    cannot be undone.
                  </p>

                  <ul className="mt-3 list-disc list-inside text-sm text-muted-foreground">
                    <li>This event will be permanently deleted</li>
                    <li>All ticket types will be removed</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </>
              }
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => {
                if (event?.id) {
                  deleteEvent(event.id, {
                    onSuccess: () => {
                      setDeleteEventId(null);
                    },
                  });
                }
              }}
              isPending={isDeleting}
            />
          )}
        </div>
      );
    }

    // list view (compressed)
    return (
      <div className="bg-neutral-900 rounded-2xl shadow-lg overflow-hidden flex hover:shadow-xl transition h-32 sm:h-36 flex-wrap sm:flex-nowrap">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-20 sm:w-32 h-full object-cover rounded-l-2xl"
          />
        ) : (
          <div className="w-20 sm:w-32 h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-l-2xl" />
        )}

        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold line-clamp-2">
                {event.title}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-neutral-300 mt-1">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {event.startDateTime
                      ? new Date(event.startDateTime).toLocaleDateString()
                      : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {event.startDateTime
                      ? new Date(event.startDateTime).toLocaleTimeString()
                      : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">
                    {event.venue}, {event.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit/Delete icons for own profile */}
            {isOwnProfile && (
              <div className="md:flex gap-1 sm:gap-2 ml-2 hidden">
                <Link
                  href={`/events/${username}/${event.id}`}
                  className="p-1 sm:p-2 hover:bg-neutral-800 rounded-md"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 hover:text-purple-400" />
                </Link>
                <Link
                  href={`/events/${username}/manage/${event.id}`}
                  className="p-1 sm:p-2 hover:bg-neutral-800 rounded-md"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 hover:text-purple-400" />
                </Link>
                <button
                  className="p-1 sm:p-2 hover:bg-neutral-800 rounded-md"
                  onClick={() => setDeleteEventId(event.id)}
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 hover:text-red-500" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm mt-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
              <span>
                {event.soldCount}/{event.capacity} attending
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 font-bold">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
              <span>{event.lowestTicketPrice}</span>
            </div>
          </div>
        </div>

        {deleteEventId && (
          <ConfirmDialog
            open={deleteEventId === event.id}
            onOpenChange={() => setDeleteEventId(null)}
            title="Delete Track"
            description={
              <>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{event?.title || "Untitled"}</strong>? This action
                  cannot be undone.
                </p>

                <ul className="mt-3 list-disc list-inside text-sm text-muted-foreground">
                  <li>This event will be permanently deleted</li>
                  <li>All ticket types will be removed</li>
                  <li>This action cannot be undone</li>
                </ul>
              </>
            }
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => {
              if (event?.id) {
                deleteEvent(event.id, {
                  onSuccess: () => {
                    setDeleteEventId(null);
                  },
                });
              }
            }}
            isPending={isDeleting}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={
        view === "grid"
          ? "grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-2 sm:gap-4"
      }
    >
      {isLoading || !events || !username
        ? renderSkeleton()
        : events.map((event) => renderEvent(event))}
      {events.length === 0 && !isLoading && (
        <p className="text-neutral-400 text-center col-span-full">
          No events to display.
        </p>
      )}
    </div>
  );
};

export default EventCard;
