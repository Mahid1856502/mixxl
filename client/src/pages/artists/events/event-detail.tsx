import { Skeleton } from "@/components/ui/skeleton";
import { useGetEventById } from "@/api/hooks/events/useEvent";
import { GetTicketModal } from "@/components/modals/get-ticket-modal";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Share2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/provider/use-auth";

const EventDetails = () => {
  const { username, eventId } = useParams();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const { data: event, isLoading } = useGetEventById(eventId);
  const isHost = !!user?.id && !!event?.hostUserId && user.id === event.hostUserId;

  const startDate = event ? new Date(event.startDateTime) : null;

  const date = startDate?.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const time = startDate?.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[420px] w-full rounded-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lowestPrice =
    (event?.tickets || []).length > 0
      ? Math.min(...(event?.tickets || [])?.map((t) => Number(t.price)))
      : "--";

  if (!event) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <Link
          href={`/events/${username}`}
          className="flex items-center gap-2 text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="overflow-hidden rounded-3xl shadow-xl">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-[420px] object-cover"
            />
          ) : (
            <div className="h-[420px] bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold">{event.title}</h1>
                <p className="text-neutral-400">
                  Hosted by <span className="text-white">{event.hostName}</span>
                </p>
              </div>

              {isHost && (
                <Link
                  href={`/events/${username}/manage/${eventId}`}
                  className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                  Edit Event
                </Link>
              )}
            </div>

            <p className="text-neutral-300">{event.description}</p>

            {(event?.genre ?? [])?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event?.genre?.map((g: string) => (
                  <span
                    key={g}
                    className="text-sm bg-neutral-800 px-3 py-1 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 bg-neutral-900 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold">Event Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-400" />
                {date}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                {time}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                {event.venue}, {event.location}
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                {event.soldCount}/{event.capacity} attending
              </div>

              <div className="flex items-center gap-2 font-semibold">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                From ${lowestPrice}
              </div>
            </div>

            <Button onClick={() => setOpen(true)} className="w-full">
              Get Ticket
            </Button>

            <button className="w-full flex items-center justify-center gap-2 border border-neutral-700 py-2 rounded-xl">
              <Share2 className="w-4 h-4" />
              Share Event
            </button>
          </aside>
        </div>
      </div>

      <GetTicketModal
        open={open}
        onClose={() => setOpen(false)}
        eventId={event?.id}
      />
    </div>
  );
};

export default EventDetails;
