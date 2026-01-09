import { GetTicketModal } from "@/components/modals/get-ticket-modal";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Music,
  Users,
  DollarSign,
  Radio,
  Share2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

const isUser = true;

const event = {
  title: "Mixxl Live Session",
  artist: "DJ Nova",
  image:
    "https://assets.simpleviewinc.com/sv-visit-irving/image/upload/c_limit,h_1200,q_75,w_1200/v1/cms_resources/clients/irving-redesign/Events_Page_Header_2903ed9c-40c1-4f6c-9a69-70bb8415295b.jpg",
  date: "March 24, 2026",
  time: "7:00 PM – 10:00 PM",
  venue: "Mixxl Studio Space",
  location: "Brooklyn, NY",
  genre: "Indie / Electronic / Hip-Hop",
  price: "$15",
  attendees: 185,
  capacity: 250,
  description:
    "Join us for an immersive Mixxl Live Session featuring DJ Nova and guest collaborators from the Mixxl community. The night includes exclusive live performances, real-time radio streaming, audience-driven playlist voting, and a post-show artist meet & greet.",
  features: [
    "Live Radio Broadcast",
    "Artist Meet & Greet",
    "Merch Booth",
    "Collaborative Playlist Voting",
  ],
};

const EventDetails = () => {
  const { username } = useParams();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <Link
          href={`/events/${username}`}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="overflow-hidden rounded-3xl shadow-xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-[420px] object-cover"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <p className="text-neutral-400">
                  Hosted by <span className="text-white">{event.artist}</span>
                </p>
              </div>

              {isUser && (
                <Link
                  href={`/events/${username}/manage`}
                  className="flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 transition px-4 py-2 rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                  Edit Event
                </Link>
              )}
            </div>

            <p className="text-neutral-300 leading-relaxed">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {event.features.map((feature) => (
                <span
                  key={feature}
                  className="text-sm bg-neutral-800 px-3 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <aside className="w-full lg:w-80 bg-neutral-900 rounded-2xl p-6 space-y-5 shadow-lg">
            <h2 className="text-lg font-semibold">Event Details</h2>

            <div className="space-y-3 text-sm">
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
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-neutral-400" />
                <span>{event.genre}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span>
                  {event.attendees}/{event.capacity} attending
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <span>{event.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-neutral-400" />
                <span>Streaming live on Mixxl Radio</span>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-primary text-white w-full"
            >
              Get Ticket
            </Button>

            <button className="w-full flex items-center justify-center gap-2 border border-neutral-700 hover:border-neutral-500 transition py-2 rounded-xl">
              <Share2 className="w-4 h-4" />
              Share Event
            </button>
          </aside>
        </div>
      </div>
      <GetTicketModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default EventDetails;
