import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import {
  Music,
  Radio,
  Star,
  Heart,
  Upload,
  Users,
  ArrowRight,
  PoundSterling,
  Shield,
  Zap,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { AdvertisingBanner } from "@/components/home/AdvertisingBanners";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { BENEFITS, FEATURES } from "@/lib/constants";
import { useRadioSessions } from "@/api/hooks/radio/useRadioSession";

interface FeaturedArtist {
  id: string;
  name: string;
  description: string;
  profileLink: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  backgroundColor?: string;
}

export default function Home() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: radioSessions = [] } = useRadioSessions();

  // Featured spots data from admin backend
  const { data: featuredSpots = [], isLoading } = useQuery({
    queryKey: ["/api/admin/featured-spots"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/featured-spots");
      if (!response.ok) throw new Error("Failed to fetch featured spots");
      return response.json();
    },
  });

  // Convert featured spots to display format
  const featuredArtistsFromSpots: FeaturedArtist[] = featuredSpots
    ?.filter((spot: any) => spot.status === "active")
    ?.map((spot: any) => ({
      id: spot.id,
      name: spot.title,
      description: spot.description,
      profileLink: spot.buttonUrl || `/profile/${spot.artist?.username}`,
      mediaUrl: spot.imageUrl || spot.videoUrl,
      mediaType: spot.imageUrl ? "image" : "video",
      backgroundColor: "from-purple-600/20 to-pink-600/20",
    }));

  // Auto-advance carousel
  useEffect(() => {
    if (featuredArtistsFromSpots.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArtistsFromSpots.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [featuredArtistsFromSpots.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredArtistsFromSpots.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + featuredArtistsFromSpots.length) %
        featuredArtistsFromSpots.length
    );
  };

  return (
    <div className="min-h-screen">
      {/* Featured Artists Hero Carousel */}
      <section className="relative min-h-[80vh] overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full mx-auto px-6">
              <Skeleton className="w-full h-64 md:h-96 rounded-xl" />
            </div>
          </div>
        ) : featuredArtistsFromSpots.length > 0 ? (
          featuredArtistsFromSpots.map((artist, index) => (
            <div
              key={artist.id}
              className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0"
                  : index < currentSlide
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              {/* Background Media */}
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
                <div className="absolute inset-0 bg-black/40"></div>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    artist.backgroundColor ||
                    "from-purple-600/30 to-pink-600/30"
                  }`}
                ></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 flex items-center min-h-[80vh] px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-left">
                    <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                      Featured Artist
                    </Badge>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                      {artist.name}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-xl">
                      {artist.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href={artist.profileLink}>
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg"
                        >
                          Visit Profile
                          <ExternalLink className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>

                      {!user && (
                        <Link href="/signup">
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
                          >
                            Join Mixxl
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Secondary content or additional media */}
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
          ))
        ) : (
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=900&fit=crop"
              alt="Mixxl Placeholder"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute z-10 flex items-center justify-center min-h-[80vh] w-full px-6 top-0">
              <div className="text-center text-white max-w-2xl">
                <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                  Featured Artist
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Be the First to Shine ✨
                </h1>
                <p className="text-lg text-gray-200 mb-8">
                  No featured artists yet — upload your music and get featured
                  on the Mixxl spotlight.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg"
                  >
                    Join Now
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        {/* Carousel Controls */}
        {featuredArtistsFromSpots.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200"
              aria-label="Previous artist"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200"
              aria-label="Next artist"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </section>

      {/* Why Choose Mixxl Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
              Artist-First Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Artists Choose Mixxl
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Keep more of your earnings with our no-commission model. See how
              much you'll actually earn compared to other platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {BENEFITS.map((benefit, index) => (
              <Card
                key={index}
                className="glass-effect border-white/10 text-center"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${benefit.bgGradient} flex items-center justify-center`}
                  >
                    <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing-comparison">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold"
              >
                Compare Earnings
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Fans Choose Mixxl Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              Fan-First Experience
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Fans Choose Mixxl
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover incredible independent music while directly supporting
              the artists you love - completely free forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-effect border-white/10 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Forever</h3>
                <p className="text-muted-foreground">
                  Discover and stream music without any subscription fees
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  24/7 Independent Radio
                </h3>
                <p className="text-muted-foreground">
                  Live radio playing only Mixxl artists with community chat
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Connect with Artists
                </h3>
                <p className="text-muted-foreground">
                  Message artists directly and watch live streaming sessions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/why-fans-choose-mixxl">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
              >
                See All Fan Benefits
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Make a dent in the music scene: An Indepen'dent'
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From uploading tracks to building a fanbase, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="glass-effect border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Radio Section */}
      {radioSessions.length > 0 && (
        <section className="py-20 px-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
              <Badge variant="destructive" className="bg-red-500">
                LIVE
              </Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Radio is Live Now!</h2>
            <p className="text-muted-foreground mb-8">
              Join the community radio and discover new music in real-time
            </p>
            <Link href="/radio">
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Radio className="w-5 h-5 mr-2" />
                Listen Live
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Recent Tracks Section */}
      <AdvertisingBanner />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-amber-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Music Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're an artist looking to share your music or a fan
            wanting to discover new sounds, Mixxl provides the perfect platform
            to connect through music.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="mixxl-gradient text-white px-8 py-4"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join as Artist
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="px-8 py-4">
                  <Heart className="w-5 h-5 mr-2" />
                  Join as Fan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-secondary/50 border-t border-gray-700 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold mixxl-gradient-text">
                  Mixxl
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                The independent music platform where artists keep 97% of their
                earnings and fans discover incredible new music for free.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="/pricing-comparison">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Pricing Comparison
                  </span>
                </Link>
                <Link href="/why-fans-choose-mixxl">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Why Fans Choose Mixxl
                  </span>
                </Link>
                <Link href="/stripe-setup">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Stripe Setup Guide
                  </span>
                </Link>
                <Link href="/blog">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Mixxl Blog
                  </span>
                </Link>
              </div>
            </div>

            {/* Support & Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support & Legal</h4>
              <div className="space-y-2">
                <Link href="/contact">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Contact Us
                  </span>
                </Link>
                <Link href="/faq">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    FAQ
                  </span>
                </Link>
                <Link href="/privacy-policy">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Privacy Policy
                  </span>
                </Link>
                <Link href="/terms-conditions">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer block">
                    Terms & Conditions
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Mixxl FM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
