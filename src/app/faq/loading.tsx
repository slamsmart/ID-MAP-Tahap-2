import { SkeletonLine } from "@/components/ui/DashboardSkeleton";

export default function FaqLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0f3d2e] py-16 animate-pulse">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <SkeletonLine className="h-10 w-64 mx-auto bg-white/10" />
          <SkeletonLine className="mt-4 h-5 w-80 mx-auto bg-white/5" />
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-6 space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="h-3 w-1/2 mt-3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
