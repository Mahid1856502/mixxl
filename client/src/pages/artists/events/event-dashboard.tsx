import {
  Users,
  DollarSign,
  Ticket,
  Radio,
  BarChart3,
  CalendarDays,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/provider/use-auth";

const stats = [
  {
    label: "Total Tickets Sold",
    value: 185,
    icon: Ticket,
  },
  {
    label: "Total Revenue",
    value: "$2,775",
    icon: DollarSign,
  },
  {
    label: "Checked In",
    value: 92,
    icon: Users,
  },
  {
    label: "Live Stream Viewers",
    value: 63,
    icon: Radio,
  },
];

const ticketTypes = [
  {
    name: "General Admission",
    price: "$15",
    sold: 120,
    capacity: 200,
  },
  {
    name: "VIP",
    price: "$40",
    sold: 35,
    capacity: 50,
  },
  {
    name: "Free RSVP",
    price: "Free",
    sold: 30,
    capacity: 50,
  },
];

export default function EventTicketDashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Dashboard</h1>
            <p className="text-neutral-400">
              Manage tickets, attendees, and revenue for your event
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

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-effect border-white/10">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ticket Types */}
        <Card className="glass-effect border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ticket Types</CardTitle>
            <button className="text-sm text-purple-400 hover:underline">
              + Add Ticket Type
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketTypes.map((ticket) => {
              const percent = Math.round((ticket.sold / ticket.capacity) * 100);

              return (
                <div
                  key={ticket.name}
                  className="border border-neutral-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-sm text-neutral-400">
                        {ticket.price} · {ticket.sold}/{ticket.capacity} sold
                      </p>
                    </div>
                    <button className="text-sm text-neutral-400 hover:text-white transition">
                      Manage
                    </button>
                  </div>

                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card className="glass-effect border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendees</CardTitle>
            <button className="text-sm text-purple-400 hover:underline">
              View All
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-neutral-800 pb-3"
              >
                <div>
                  <p className="font-medium">User #{i}</p>
                  <p className="text-sm text-neutral-400">General Admission</p>
                </div>
                <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                  Paid
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>Event Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <div>🎟️ 2 VIP tickets sold</div>
            <div>💰 $30 revenue generated</div>
            <div>📡 Live stream started</div>
            <div>👤 User checked in</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
