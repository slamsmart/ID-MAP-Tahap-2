"use client";

import { ReactNode } from "react";

/**
 * QueryBoundary — renders a skeleton while a Convex `useQuery` is hydrating
 * (returns `undefined`) and switches to children once data resolves
 * (including the explicit `null` "no record" case).
 *
 * Usage:
 *   const data = useQuery(api.foo.get);
 *   <QueryBoundary data={data} skeleton={<MySkeleton />}>
 *     {(value) => <Real value={value} />}
 *   </QueryBoundary>
 *
 * The render-prop form lets callers narrow `value` to non-undefined inside
 * children without manual checks.
 */
export function QueryBoundary<T>({
  data,
  skeleton,
  children,
}: {
  data: T | undefined;
  skeleton: ReactNode;
  children: (value: T) => ReactNode;
}) {
  if (data === undefined) return <>{skeleton}</>;
  return <>{children(data)}</>;
}

/** Generic shimmering block — composable building block for page skeletons. */
export function SkeletonBlock({
  className = "",
  rounded = "rounded-card",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-gray-100 animate-pulse ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

/** Card-shaped skeleton — for project / certificate / contribution cards. */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-card border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <SkeletonBlock className="h-5 w-32" rounded="rounded-input" />
        <SkeletonBlock className="h-20 w-20" rounded="rounded-card" />
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonBlock className="h-3 w-3/4" rounded="rounded-input" />
        <SkeletonBlock className="h-3 w-2/3" rounded="rounded-input" />
        <SkeletonBlock className="h-3 w-1/2" rounded="rounded-input" />
      </div>
      <SkeletonBlock className="mt-5 h-10 w-32" rounded="rounded-button" />
    </div>
  );
}

/** Stat-tile skeleton — for hero / dashboard counters. */
export function SkeletonStat() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="h-7 w-24" rounded="rounded-input" />
      <SkeletonBlock className="h-3 w-32" rounded="rounded-input" />
    </div>
  );
}
