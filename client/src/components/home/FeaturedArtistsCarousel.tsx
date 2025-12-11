"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ExternalLink, Star } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"; // ← import your provided carousel

interface FeaturedArtist {
  id: string;
  name: string;
  description: string;
  profileLink: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  backgroundColor?: string;
}

interface FeaturedArtistsCarouselProps {
  user?: any;
}

export function FeaturedArtistsCarousel({
  user,
}: FeaturedArtistsCarouselProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-artists"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/featured-spots");
      if (!res.ok) throw new Error("Failed to fetch featured spots");
      const spots = await res.json();
      return spots
        ?.filter((spot: any) => spot.status === "active")
        ?.map((spot: any) => ({
          id: spot.id,
          name: spot.title,
          description: spot.description,
          profileLink: spot.buttonUrl,
          mediaUrl: spot.imageUrl || spot.videoUrl,
          mediaType: spot.imageUrl ? "image" : "video",
          backgroundColor: "from-purple-600/30 to-pink-600/30",
        })) as FeaturedArtist[];
    },
  });

  const artists = data || [];

  // ---------- Skeleton ----------
  if (isLoading) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center bg-black/40">
        <div className="w-full px-6">
          <Skeleton className="w-full h-64 md:h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  // ---------- Fallback ----------
  if (artists.length === 0) {
    return (
      <div className="relative min-h-[70vh]">
        <img
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=900&fit=crop"
          alt="Mixxl Placeholder"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center text-white max-w-2xl">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
              Featured Artist
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Be the First to Shine ✨
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              No featured artists yet — upload your music and get featured on
              the Mixxl spotlight.
            </p>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg">
                Join Now
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Carousel ----------
  return (
    <div className="relative min-h-[80vh]">
      <Carousel
        opts={{ loop: true, align: "start" }}
        className="w-full overflow-hidden"
        autoScroll={{ interval: 3000 }} // ⬅️ Auto-scroll every 3s (optional)
      >
        <CarouselContent>
          {artists.map((artist) => (
            <CarouselItem key={artist.id}>
              <div className="relative min-h-[80vh] flex items-center">
                {/* Background */}
                <div className="absolute inset-0">
                  {artist.mediaType === "video" ? (
                    <video
                      src={artist.mediaUrl}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={artist.mediaUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${artist.backgroundColor}`}
                  />
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 w-full px-6">
                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left">
                      <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                        Featured Artist
                      </Badge>
                      <h1 className="text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6">
                        {artist.name}
                      </h1>
                      <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-xl">
                        {artist.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {artist.profileLink && (
                          <Link href={artist.profileLink}>
                            <Button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold px-8 py-4 text-sm md:text-lg">
                              Visit Profile
                              <ExternalLink className="ml-2 w-5 h-5" />
                            </Button>
                          </Link>
                        )}
                        {!user && (
                          <Link href="/signup">
                            <Button
                              variant="outline"
                              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-sm md:text-lg backdrop-blur-sm"
                            >
                              Join Mixxl
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:flex justify-center items-center">
                      <div className="text-center text-white/80">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium">
                            Independent Artist
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">
                          Make a dent in the music scene: An Indepen'dent'
                        </h3>
                        <p className="text-lg">
                          Where independent artists thrive and music lovers
                          discover their next favorite sound
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-6 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
        <CarouselNext className="right-6 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
      </Carousel>
    </div>
  );
}
