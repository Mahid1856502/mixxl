import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistBannerSkeleton() {
  return (
    <div className="w-full mb-10">
      <Skeleton className="w-full h-[20rem] md:h-56 rounded-xl mb-4" />
      <Skeleton className="w-48 h-6 mb-2" />
      <Skeleton className="w-96 h-4" />
    </div>
  );
}
