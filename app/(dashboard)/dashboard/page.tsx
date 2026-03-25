import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardIndexPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  const ROLE_ROUTES: Record<string, string> = {
    patient: "/dashboard/patient",
    provider: "/dashboard/provider",
    pharmacist: "/dashboard/pharmacist",
    admin: "/dashboard/admin",
  };

  redirect(ROLE_ROUTES[role] ?? "/login");
}
