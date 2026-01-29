import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useUser } from "@/api/hooks/users/useUser";
import { useAuth } from "@/provider/use-auth";
import { useGetEventsByHost } from "@/api/hooks/events/useEvent";
import EventCard from "@/components/event/event-card";

const Events = () => {
  const { username } = useParams();
  const { data: currUser, isLoading: currUserLoading } = useUser(username);
  const { user } = useAuth();
  const { data: events, isLoading } = useGetEventsByHost(currUser?.id);
  const isOwnProfile = currUser?.id === user?.id;

  // Number of skeleton cards to display while loading

  return (
    <div className="min-h-screen text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col gap-6">
          <div className="gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold mb-3">Events</h1>
              {isOwnProfile && (
                <Link href={`/events/${username}/manage`}>
                  <Button className="bg-primary text-white gap-2 text-xs md:text-base">
                    <Plus className="w-4 h-4 hidden sm:block" />
                    Add Event
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-neutral-400 md:max-w-2xl text-sm md:text-base">
              Explore concerts, live radio sessions, and community-powered
              events from independent artists across the Mixxl ecosystem.
            </p>
          </div>
        </header>

        <EventCard
          events={events || []}
          username={username!}
          isOwnProfile={isOwnProfile}
          isLoading={isLoading || currUserLoading}
          view={isOwnProfile ? "list" : "grid"}
        />
      </div>
    </div>
  );
};

export default Events;
