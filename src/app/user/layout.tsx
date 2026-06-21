import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SessionGuard from "@/components/shared/SessionGuard";
import TopLoadingBar from "@/components/ui/TopLoadingBar";
import PageTransition from "@/components/ui/PageTransition";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard allowedRoles={["sahabat"]}>
      <TopLoadingBar />
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar type="user" />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            avatarInitials="KH"
            avatarCls="bg-lime-400/20 text-lime-300"
          />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}

