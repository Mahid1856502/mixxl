import { Music } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  variant?: "icon" | "text" | "full";
  className?: string;
}

export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12",
    xl: "h-16",
    xxl: "h-20"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12", 
    xl: "w-16 h-16",
    xxl: "w-20 h-20"
  };

  if (variant === "icon") {
    return (
      <div className={`${iconSizes[size]} rounded-lg mixxl-gradient flex items-center justify-center ${className}`}>
        <Music className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-8 h-8"} text-white`} />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span className={`font-bold mixxl-gradient-text ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-3xl"} ${className}`}>
        Mixxl
      </span>
    );
  }

  // Try to use the uploaded logo image, fallback to icon + text
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <img 
        src="/mixxl-logo.png" 
        alt="Mixxl"
        className={`${sizeClasses[size]} w-auto`}
        onError={(e) => {
          // Fallback to icon + text if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div className="hidden items-center space-x-2">
        <div className={`${iconSizes[size]} rounded-lg mixxl-gradient flex items-center justify-center`}>
          <Music className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-8 h-8"} text-white`} />
        </div>
        <span className={`font-bold mixxl-gradient-text ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-3xl"}`}>
          Mixxl
        </span>
      </div>
    </div>
  );
}