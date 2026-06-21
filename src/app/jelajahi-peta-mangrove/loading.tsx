import { SkeletonLine } from "@/components/ui/DashboardSkeleton";

export default function MapLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero area */}
      <section className="bg-[#0f3d2e] py-12 animate-pulse">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SkeletonLine className="h-9 w-72 mx-auto bg-white/10" />
          <SkeletonLine className="mt-3 h-4 w-96 mx-auto bg-white/5" />
        </div>
      </section>

      {/* Map placeholder */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="w-full h-[500px] bg-gray-100 rounded-2xl animate-pulse grid place-items-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full animate-pulse" />
            <SkeletonLine className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
