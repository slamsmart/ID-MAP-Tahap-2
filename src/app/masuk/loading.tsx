import { SkeletonLine } from "@/components/ui/DashboardSkeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 px-4 animate-pulse">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100" />
          </div>
          {/* Title */}
          <div className="text-center space-y-2">
            <SkeletonLine className="h-7 w-40 mx-auto" />
            <SkeletonLine className="h-4 w-56 mx-auto" />
          </div>
          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <SkeletonLine className="h-3 w-12 mb-2" />
              <div className="h-11 bg-gray-50 rounded-lg border border-gray-100" />
            </div>
            <div>
              <SkeletonLine className="h-3 w-16 mb-2" />
              <div className="h-11 bg-gray-50 rounded-lg border border-gray-100" />
            </div>
          </div>
          {/* Button */}
          <div className="h-12 bg-emerald-100 rounded-xl" />
          {/* Links */}
          <div className="flex justify-center gap-4">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
