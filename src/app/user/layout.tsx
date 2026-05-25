import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SessionGuard from "@/components/shared/SessionGuard";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard allowedRoles={["sahabat"]}>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="user" />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            title="Beranda"
            avatarInitials="KH"
            avatarCls="bg-emerald-500/20 text-emerald-300"
          />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
