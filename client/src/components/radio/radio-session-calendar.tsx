import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useAuth } from "@/provider/use-auth";
import { RadioSession } from "@shared/schema";
import { useRadioSessions } from "@/api/hooks/radio/useRadioSession";
import { useEndSession, useGoLive } from "@/api/hooks/radio/useSessionStatus";
import { RadioSessionModal } from "./radio-session-modal";
import { Alert, AlertDescription } from "../ui/alert";
import { CalendarIcon, Pencil, Radio, X } from "lucide-react";
import { Button } from "../ui/button";
import { useWebSocket } from "@/hooks/use-websocket";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function MyCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<RadioSession | null>(
    null
  );

  const { data: allSessions = [] } = useRadioSessions();
  const { mutate: goLive, isPending: starting } = useGoLive();
  const { mutate: endSession, isPending: ending } = useEndSession();
  const [showCreate, setShowCreate] = useState(false);

  // Convert API sessions into react-big-calendar events
  const events = allSessions.map((session) => ({
    ...session,
    title: session.title,
    start: session.scheduledStart ? new Date(session.scheduledStart) : null,
    end: session.scheduledEnd ? new Date(session.scheduledEnd) : null,
  }));

  useEffect(() => {
    if (!selectedSession) return;
    setSelectedSession(null);
  }, [allSessions]);
  return (
    <div className="glass-effect p-3 rounded-sm mb-3">
      {/* 🔹 Show selected event details */}
      {selectedSession && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CalendarIcon className="h-4 w-4 text-black" color="brown" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <div className="font-medium text-lg text-yellow-800 dark:text-yellow-200">
                {selectedSession.title}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {selectedSession.scheduledStart &&
                  new Date(
                    selectedSession.scheduledStart
                  ).toLocaleString()}{" "}
                –{" "}
                {selectedSession.scheduledEnd &&
                  new Date(selectedSession.scheduledEnd).toLocaleString()}
              </div>
            </div>

            {user?.role === "DJ" && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreate(true)}
                  className="bg-yellow-200 border-yellow-400 text-yellow-800 hover:bg-yellow-300 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-800"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                {/* 🔹 Show Go Live / End Session depending on state */}
                {selectedSession &&
                  (() => {
                    const now = new Date();
                    const start = selectedSession.scheduledStart
                      ? new Date(selectedSession.scheduledStart)
                      : null;
                    const end = selectedSession.scheduledEnd
                      ? new Date(selectedSession.scheduledEnd)
                      : null;

                    if (selectedSession.isLive) {
                      return (
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={ending}
                          onClick={() => endSession(selectedSession.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          End Session
                        </Button>
                      );
                    }

                    if (
                      start &&
                      end &&
                      now >= start &&
                      now <= end &&
                      !selectedSession.isLive
                    ) {
                      return (
                        <Button
                          size="sm"
                          disabled={starting}
                          onClick={() => goLive(selectedSession.id)}
                        >
                          <Radio className="w-4 h-4 mr-2" />
                          Go Live
                        </Button>
                      );
                    }

                    return null;
                  })()}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 🔹 Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 600 }}
        defaultView={Views.WEEK}
        views={[Views.WEEK, Views.DAY]}
        onSelectEvent={(event: RadioSession) => {
          if (event?.scheduledEnd && new Date(event.scheduledEnd) < new Date())
            return;
          setSelectedSession(event);
          setSelectedDate(null);
        }}
        onSelectSlot={(slotInfo) => {
          if (slotInfo.start && new Date(slotInfo.start) < new Date()) return;
          setSelectedSession(null);
          setSelectedDate(slotInfo.start as Date);
          setShowCreate(true);
        }}
        slotPropGetter={(date) => {
          if (date && new Date(date) < new Date()) {
            return {
              style: {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "rgba(255, 255, 255, 0.6)",
                pointerEvents: "none",
              },
            };
          }
          return {};
        }}
        eventPropGetter={(event) => {
          const now = new Date();
          const start = event.start ? new Date(event.start) : null;
          const end = event.end ? new Date(event.end) : null;
          if (start && start > now) {
            return {
              style: { backgroundColor: "#a855f7", color: "#1f2937" },
            };
          }
          if (start && end && start <= now && end >= now) {
            return { style: { backgroundColor: "#4ade80", color: "#fff" } };
          }
          if (end && end < now) {
            return {
              style: {
                backgroundColor: "#9ca3af",
                color: "#1f2937",
                pointerEvents: "none",
              },
            };
          }
          return {};
        }}
      />

      {user?.role === "DJ" && (
        <RadioSessionModal
          key={showCreate ? "create" : selectedSession?.id}
          open={showCreate}
          onOpenChange={setShowCreate}
          session={selectedSession ?? undefined}
          selectedDate={selectedDate || selectedSession?.scheduledStart}
        />
      )}
    </div>
  );
}
