import { SkeletonLine, SkeletonCard } from "@/components/ui/DashboardSkeleton";

export default function ProyekLoading() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0f3d2e] py-12 animate-pulse">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SkeletonLine className="h-9 w-64 mx-auto bg-white/10" />
          <SkeletonLine className="mt-3 h-4 w-80 mx-auto bg-white/5" />
        </div>
      </section>
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <SkeletonLine className="h-5 w-3/4" />
                  <SkeletonLine className="h-3 w-1/2" />
                  <div className="h-2 bg-gray-100 rounded-full" />
                  <SkeletonLine className="h-8 w-full bg-emerald-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
