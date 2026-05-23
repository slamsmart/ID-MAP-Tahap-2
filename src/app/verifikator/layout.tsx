import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SessionGuard from "@/components/shared/SessionGuard";

export default function VerifikatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard allowedRoles={["verifikator"]}>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="verifikator" />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
            <div className="md:hidden w-8" />
            <h2 className="text-sm font-semibold text-gray-700">Dashboard Verifikator</h2>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                VR
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
