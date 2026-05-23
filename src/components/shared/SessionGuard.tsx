"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function SessionGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/masuk");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      // Redirect to their proper dashboard if they try to access another role's dashboard
      router.push(`/${session.role === "komunitas" ? "user" : session.role === "verifikator" ? "verifikator" : session.role}`);
      return;
    }

    setIsAuthorized(true);
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
