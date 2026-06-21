import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SessionGuard from "@/components/shared/SessionGuard";
import TopLoadingBar from "@/components/ui/TopLoadingBar";
import PageTransition from "@/components/ui/PageTransition";

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard allowedRoles={["corporate"]}>
      <TopLoadingBar />
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="corporate" />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            avatarInitials="CP"
            avatarCls="bg-violet-500/20 text-violet-300"
          />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
