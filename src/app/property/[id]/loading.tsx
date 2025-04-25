import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Property Image Skeleton */}
      <Skeleton className="w-full h-[300px]" />

      {/* Property Info Skeleton */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-12 w-12 rounded-md mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>

        <Skeleton className="h-10 w-full mt-4" />

        <div className="mt-3 flex justify-center">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Content Sections Skeleton */}
      {[1, 2, 3, 4, 5, 6].map((section) => (
        <div key={section} className="p-4 border-b space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      ))}

      {/* Fixed Bottom CTA Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}

