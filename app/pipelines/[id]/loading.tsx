import { Skeleton } from "@/components/ui/Skeleton";

export default function PipelineDetailLoading() {
  return (
    <div className="flex-1 px-6 py-6 space-y-6">
      <Skeleton className="h-3 w-24" />

      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 flex gap-4 items-center">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-3 w-72 flex-1" />
        <div className="flex gap-4 ml-auto">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      <div className="bg-[#161b22] border border-white/5 rounded-xl px-5 py-3 flex gap-2 items-center">
        <Skeleton className="h-6 w-36 rounded" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-6 w-36 rounded" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-6">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-24 mt-1" />
              <Skeleton className="h-3 w-24 mt-1" />
              <Skeleton className="h-3 w-12 mt-1 ml-auto" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
