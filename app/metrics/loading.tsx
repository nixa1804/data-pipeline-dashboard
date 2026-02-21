import { Skeleton } from "@/components/ui/Skeleton";

export default function MetricsLoading() {
  return (
    <div className="flex-1 px-6 py-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-5 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-56 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      ))}
    </div>
  );
}
