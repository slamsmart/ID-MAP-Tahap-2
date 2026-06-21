/**
 * Reusable skeleton primitives for dashboard loading states.
 * Used by loading.tsx files across all role-based dashboards.
 */

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-5 w-16 bg-gray-100 rounded" />
        </div>
        <div className="w-9 h-9 rounded-lg bg-gray-100" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-2.5 bg-gray-50 rounded mt-2" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-gray-100" />
        <div className="space-y-1.5">
          <div className="h-4 w-40 bg-gray-100 rounded" />
          <div className="h-2.5 w-24 bg-gray-50 rounded" />
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-4 bg-gray-50 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
              <div className="h-2.5 bg-gray-50 rounded w-1/3" />
            </div>
            <div className="h-5 w-16 bg-gray-50 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />;
}

/** Full dashboard skeleton — stats cards + two-column content */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Two-column content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SkeletonTable rows={3} />
        <SkeletonTable rows={3} />
      </div>
    </div>
  );
}
