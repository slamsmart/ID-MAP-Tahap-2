"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, refreshSession } from "@/lib/auth";

export default function SessionGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const evaluate = (sessionRole: string | undefined) => {
      if (cancelled) return;
      if (!sessionRole) {
        router.push("/masuk");
        return;
      }
      if (allowedRoles && !allowedRoles.includes(sessionRole)) {
        router.push(`/${sessionRole === "sahabat" ? "user" : sessionRole}`);
        return;
      }
      setIsAuthorized(true);
    };

    // Cek cache lokal dulu (instant), lalu konfirmasi via /api/auth/me
    // supaya cookie HttpOnly menjadi sumber kebenaran.
    const cached = getSession();
    if (cached) evaluate(cached.role);
    refreshSession().then((u) => {
      evaluate(u?.role);
    });

    const onChange = () => {
      const next = getSession();
      evaluate(next?.role);
    };
    window.addEventListener("session:change", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("session:change", onChange);
    };
  }, [router, pathname, allowedRoles]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
