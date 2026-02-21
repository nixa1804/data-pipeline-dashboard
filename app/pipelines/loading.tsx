import { Skeleton } from "@/components/ui/Skeleton";

export default function PipelinesLoading() {
  return (
    <div className="flex-1 px-6 py-6 space-y-4">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-28 rounded" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-6 w-28 rounded" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
