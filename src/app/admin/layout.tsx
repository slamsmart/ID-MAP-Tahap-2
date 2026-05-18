import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SessionGuard from "@/components/shared/SessionGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="admin" />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
            <div className="md:hidden w-8" />
            <h2 className="font-display font-semibold text-gray-800 text-sm">
              Dashboard Admin
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">
                AD
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
