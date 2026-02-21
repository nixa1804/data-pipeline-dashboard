import { Skeleton } from "@/components/ui/Skeleton";

export default function AlertsLoading() {
  return (
    <div className="flex-1 px-6 py-6 space-y-4 max-w-3xl">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-lg" />
        ))}
      </div>
      <div className="bg-[#161b22] border border-white/5 rounded-xl divide-y divide-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-start gap-3">
            <Skeleton className="w-7 h-7 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
