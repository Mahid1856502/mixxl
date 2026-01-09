import {
  CalendarDays,
  MapPin,
  Music,
  Users,
  Clock,
  DollarSign,
  Radio,
  Ticket,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useUser } from "@/api/hooks/users/useUser";
import { useAuth } from "@/provider/use-auth";

const events = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: `Mixxl Live Session #${i + 1}`,
  artist: `Artist ${i + 1}`,
  date: "March 24, 2026",
  time: "7:00 PM – 10:00 PM",
  location: "Brooklyn, NY",
  venue: "Mixxl Studio Space",
  genre: "Indie / Electronic / Hip‑Hop",
  price: i % 2 === 0 ? "Free" : "15",
  attendees: 120 + i * 15,
  capacity: 250,
  image: `https://assets.simpleviewinc.com/sv-visit-irving/image/upload/c_limit,h_1200,q_75,w_1200/v1/cms_resources/clients/irving-redesign/Events_Page_Header_2903ed9c-40c1-4f6c-9a69-70bb8415295b.jpg`,
  description:
    "Experience an immersive live performance featuring independent artists from the Mixxl community. Enjoy exclusive previews, live radio streaming, and collaborative jam sessions.",
  features: [
    "Live Radio Broadcast",
    "Artist Meet & Greet",
    "Merch Booth",
    "Collaborative Playlist Voting",
  ],
}));

const Events = () => {
  const { username } = useParams();
  const { data: currUser } = useUser(username);
  const { user } = useAuth();
  const isOwnProfile = currUser?.id === user?.id;
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Mixxl Events</h1>
              <p className="text-neutral-400 max-w-2xl">
                Explore concerts, live radio sessions, and community-powered
                events from independent artists across the Mixxl ecosystem.
              </p>
            </div>

            {isOwnProfile && (
              <Link href={`/events/${username}/manage`}>
                <Button className="bg-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Event
                </Button>
              </Link>
            )}
          </div>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-neutral-900 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between hover:shadow-xl transition"
            >
              <div className="space-y-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-xl"
                />
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold leading-tight">
                      {event.title}
                    </h2>
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>

                  <p className="text-sm text-neutral-400">
                    Hosted by <span className="text-white">{event.artist}</span>
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-neutral-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
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
                    {event.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-neutral-800 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-neutral-800 space-y-3 text-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span>
                      {event.attendees}/{event.capacity} attending
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-base md:text-lg">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    <span>{event.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-neutral-400" />
                  <span>Streaming live on Mixxl Radio</span>
                </div>

                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button className="flex-1 border border-neutral-700 hover:border-neutral-500 transition rounded-xl py-2 font-medium">
                      Edit
                    </button>
                    <button className="flex-1 border border-neutral-700 hover:border-neutral-500 transition rounded-xl py-2 font-medium">
                      Manage
                    </button>
                  </div>
                )}

                <Link
                  href={`/events/${username}/${event.id}`}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition rounded-xl py-2 font-medium"
                >
                  <Ticket className="w-4 h-4" />
                  View Event Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
