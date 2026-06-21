import { SkeletonLine } from "@/components/ui/DashboardSkeleton";

export default function TentangLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0f3d2e] py-16 sm:py-20 animate-pulse">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <SkeletonLine className="h-10 sm:h-12 w-72 sm:w-96 mx-auto bg-white/10" />
          <SkeletonLine className="mt-4 h-5 w-80 sm:w-[28rem] mx-auto bg-white/5" />
        </div>
      </section>

      {/* Apa itu */}
      <section className="py-12 sm:py-16 animate-pulse">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <SkeletonLine className="h-8 w-48" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-5/6" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-3/4" />
            </div>
            <div className="bg-emerald-50 rounded-2xl p-8 space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLine className="h-4 w-16" />
                    <SkeletonLine className="h-3 w-full" />
                    <SkeletonLine className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-12 sm:py-16 bg-gray-50 animate-pulse">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <SkeletonLine className="h-8 w-64 mx-auto" />
            <SkeletonLine className="mt-3 h-4 w-96 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg mb-4" />
                <SkeletonLine className="h-4 w-32 mb-2" />
                <SkeletonLine className="h-3 w-full" />
                <SkeletonLine className="h-3 w-4/5 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
