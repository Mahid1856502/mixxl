import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Cover/Header */}
      <div className="relative h-64 overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full" />

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Skeleton className="h-32 w-32 rounded-full" />

              {/* Profile info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Badges / meta */}
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-6 w-10 mx-auto" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-28 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
