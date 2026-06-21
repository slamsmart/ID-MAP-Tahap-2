import { SkeletonLine } from "@/components/ui/DashboardSkeleton";

export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 px-4 animate-pulse">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          {/* Logo + Title */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100" />
            <SkeletonLine className="h-7 w-48" />
            <SkeletonLine className="h-4 w-64" />
          </div>
          {/* Role selector */}
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 h-16 bg-gray-50 rounded-xl border border-gray-100" />
            ))}
          </div>
          {/* Form fields */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <SkeletonLine className="h-3 w-20 mb-2" />
                <div className="h-11 bg-gray-50 rounded-lg border border-gray-100" />
              </div>
            ))}
          </div>
          {/* Button */}
          <div className="h-12 bg-emerald-100 rounded-xl" />
          {/* Footer link */}
          <SkeletonLine className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
