"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, BASE_URL } from "@/lib/queryClient";
import { Banner } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Import Skeleton here

export function AdvertisingBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: banners = [],
    isLoading,
    isError,
  } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/banners");
      return response.json();
    },
  });

  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  if (isLoading) {
    // Show skeleton loading UI
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="rounded-lg h-72 w-full" />
        </div>
      </section>
    );
  }

  if (banners.length === 0 || isError) {
    return null; // or error UI
  }

  const current = banners[currentIndex];

  function prevSlide() {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto relative">
        <div
          key={current.id}
          className="rounded-lg p-10 text-white bg-center bg-cover relative overflow-hidden h-72 flex items-center justify-center transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: current.imageUrl
              ? `url(${BASE_URL}${current.imageUrl})`
              : "linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)",
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative z-10 text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-bold">
              {current.title || "Advertise with Us"}
            </h2>
            <p className="mb-6">
              {current.description ||
                "Get your brand in front of thousands of listeners every day."}
            </p>
            {current.cta && current.ctaUrl && (
              <Link href={current.ctaUrl}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
                >
                  {current.cta} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>

          {/* Controls */}
          <button
            aria-label="Previous Slide"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            aria-label="Next Slide"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
