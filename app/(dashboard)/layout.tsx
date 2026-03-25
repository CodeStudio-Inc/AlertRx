import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { UserRole } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.onboardingCompleted && session.user.role !== "admin") {
    redirect("/onboarding");
  }

  const user = {
    name: session.user.name ?? "User",
    role: session.user.role as UserRole,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <Sidebar role={user.role} userName={user.name} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header role={user.role} userName={user.name} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
