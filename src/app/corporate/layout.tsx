import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SessionGuard from "@/components/shared/SessionGuard";

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard allowedRoles={["verifikator"]}>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="verifikator" />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            title="Dashboard Corporate"
            avatarInitials="CP"
            avatarCls="bg-violet-500/20 text-violet-300"
          />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
