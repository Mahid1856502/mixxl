// components/artist/store/ArtistBanner.tsx
import { Box, ExternalLink, Pencil, MoreVertical } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

type ArtistBannerProps = {
  name: string;
  bio: string;
  banner: string;
  links: Record<string, string>;
  isOwnProfile?: boolean;
};

const ArtistBanner = ({
  name,
  bio,
  banner,
  links,
  isOwnProfile = false,
}: ArtistBannerProps) => {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-[20rem] overflow-hidden mb-8 rounded-xl">
      {/* Manage Dropdown Button */}
      {isOwnProfile && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              px-3 py-2 md:px-4 md:py-2 rounded-full md:rounded-xl
              bg-white/10 hover:bg-white/20
              border border-white/20 text-white
              shadow-lg backdrop-blur-md
              flex items-center gap-2
              transition
            "
          >
            <MoreVertical className="w-4 h-4" />
            <span className="hidden md:inline">Manage</span>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg overflow-hidden z-30">
              <button
                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-white/10 transition"
                onClick={() => {
                  setLocation(`/store/${location.split("/")[2]}/manage`);
                  setMenuOpen(false);
                }}
              >
                <Pencil className="w-4 h-4" /> Manage Store
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-white/10 transition"
                onClick={() => {
                  setLocation(`/store/${location.split("/")[2]}/products`);
                  setMenuOpen(false);
                }}
              >
                <Box className="w-4 h-4" /> Manage Products
              </button>
            </div>
          )}
        </div>
      )}

      {/* Background Image */}
      <img
        src={banner}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover opacity-80 scale-110 animate-slow-zoom"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-gray-950" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-0 md:p-8 rounded-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              {name}
            </h1>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl mb-6">
              {bio}
            </p>

            {/* Social Links */}
            <div className="flex gap-3 flex-wrap">
              {Object.entries(links).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2
                    px-3 py-2 sm:px-4 sm:py-2
                    rounded-full sm:rounded-xl
                    bg-white/10 hover:bg-white/20 transition
                    border border-white/20 text-white shadow-lg backdrop-blur-md
                  "
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">{key}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistBanner;
