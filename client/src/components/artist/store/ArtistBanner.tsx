// components/artist/store/ArtistBanner.tsx
import { ExternalLink } from "lucide-react";

type ArtistBannerProps = {
  name: string;
  bio: string;
  banner: string;
  links: Record<string, string>;
};

const ArtistBanner = ({ name, bio, banner, links }: ArtistBannerProps) => {
  return (
    <div className="relative w-full h-[28rem] overflow-hidden mb-16 rounded-xl">
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
          <div className="p-6 md:p-8 rounded-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
              {name}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mb-6">{bio}</p>

            {/* Social Links */}
            <div className="flex gap-3 flex-wrap">
              {Object.entries(links).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                             bg-white/10 hover:bg-white/20 transition
                             border border-white/20 text-white shadow-lg backdrop-blur-md"
                >
                  {key}
                  <ExternalLink className="w-4 h-4" />
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
