"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, refreshSession } from "@/lib/auth";

function loginPathFor(allowedRoles?: string[]): string {
  if (!allowedRoles || allowedRoles.length === 0) return "/masuk";
  if (allowedRoles.length === 1 && allowedRoles[0] === "admin") return "/masuk/admin";
  if (allowedRoles.includes("verifikator")) return "/masuk/verifikator";
  return "/masuk";
}

export default function SessionGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loginPath = loginPathFor(allowedRoles);

    const evaluate = (sessionRole: string | undefined) => {
      if (cancelled) return;
      if (!sessionRole) {
        router.push(loginPath);
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
