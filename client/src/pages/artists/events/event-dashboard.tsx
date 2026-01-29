import { useState } from "react";
import {
  Users,
  DollarSign,
  Ticket,
  Radio,
  Settings,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/provider/use-auth";
import {
  useGetEventsByHost,
  useGetEventById,
  useGetEventDashboardStats,
} from "@/api/hooks/events/useEvent";
import type { Event } from "@shared/schema";

const statCards = [
  { label: "Total Tickets Sold", key: "totalTicketsSold" as const, icon: Ticket },
  { label: "Total Revenue", key: "totalRevenue" as const, icon: DollarSign },
  { label: "Events", key: "eventCount" as const, icon: Users },
  { label: "Total Capacity", key: "totalCapacity" as const, icon: Radio },
];

function formatStatDisplay(
  label: string,
  value: number
): string | number {
  if (label === "Total Revenue") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  }
  return value;
}

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(n) || n === 0) return "Free";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

function EventRow({
  event,
  isExpanded,
  onToggle,
}: {
  event: Event;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: eventDetail } = useGetEventById(isExpanded ? event.id : undefined);
  const sold = event.soldCount ?? 0;
  const cap = event.capacity ?? 0;
  const percent = cap > 0 ? Math.round((sold / cap) * 100) : 0;
  const eventRevenue = eventDetail?.revenue ?? 0;

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
        )}
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt=""
            className="w-14 h-14 rounded-lg object-cover shrink-0 bg-neutral-800"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-neutral-800 shrink-0 flex items-center justify-center text-neutral-500">
            <CalendarDays className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400 mt-0.5">
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.venue}
              </span>
            )}
            {event.startDateTime && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatDate(event.startDateTime)}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-sm">
          <span className="text-neutral-400">Tickets:</span>{" "}
          <span className="font-medium">{sold}/{cap}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-800 bg-black/20 px-4 pb-4 pt-2">
          {eventDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-neutral-400">Tickets sold</p>
                  <p className="text-lg font-semibold">{eventDetail.soldCount ?? 0}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-neutral-400">Capacity</p>
                  <p className="text-lg font-semibold">{eventDetail.capacity ?? 0}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-neutral-400">Revenue</p>
                  <p className="text-lg font-semibold">{formatPrice(eventRevenue)}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-neutral-400">Fill rate</p>
                  <p className="text-lg font-semibold">{percent}%</p>
                </div>
              </div>

              {eventDetail.tickets && eventDetail.tickets.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-400 mb-2">Ticket types</p>
                  <div className="space-y-3">
                    {eventDetail.tickets.map((t) => {
                      const tSold = t.soldCount ?? 0;
                      const tCap = t.capacity ?? 0;
                      const tPercent = tCap > 0 ? Math.round((tSold / tCap) * 100) : 0;
                      return (
                        <div
                          key={t.id}
                          className="border border-neutral-800 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{t.name}</p>
                            <p className="text-sm text-neutral-400">
                              {formatPrice(t.price)} · {tSold}/{tCap} sold
                            </p>
                          </div>
                          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600"
                              style={{ width: `${tPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-neutral-400 text-sm">
              Loading event details…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EventTicketDashboard() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: events = [], isLoading } = useGetEventsByHost(user?.id);
  const { data: dashboardStats, isLoading: statsLoading } =
    useGetEventDashboardStats(user?.id);

  return (
    <div className="min-h-screen text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Dashboard</h1>
            <p className="text-neutral-400">
              Manage tickets, attendees, and revenue across your events
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/events/${user?.username?.toLocaleLowerCase()}`}
              className="flex items-center gap-2 bg-primary hover:bg-purple-800 transition px-4 py-2 rounded-xl"
            >
              <Settings className="w-4 h-4" />
              Manage Events
            </Link>
          </div>
        </header>

        {/* Aggregate stats from API */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const value =
              dashboardStats != null
                ? dashboardStats[stat.key]
                : 0;
            const display = formatStatDisplay(stat.label, value);
            return (
              <Card key={stat.label} className="glass-effect border-white/10">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">{stat.label}</p>
                    <p className="text-2xl font-semibold">
                      {statsLoading ? "—" : display}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* All events – expand for per-event metrics */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>All events</CardTitle>
            <p className="text-sm text-neutral-400 mt-1">
              Click an event to see tickets sold, revenue, and ticket types
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-neutral-400">Loading events…</div>
            ) : events.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                No events yet. Create one from Manage Events.
              </div>
            ) : (
              events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  isExpanded={expandedId === event.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === event.id ? null : event.id))
                  }
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
