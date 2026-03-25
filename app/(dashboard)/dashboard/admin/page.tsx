import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAdminDashboardData } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/shared/metric-card";
import { UsersTable } from "@/components/admin/users-table";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Users,
  Building2,
  Bell,
  ShieldCheck,
  Activity,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Platform-wide overview and management.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/admin/facilities">
              <Building2 className="h-4 w-4" />
              Facilities
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/admin/users">
              <Users className="h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
          description="All roles"
        />
        <MetricCard
          title="Active Patients"
          value={data.activePatients}
          icon={Activity}
          description="Onboarded"
        />
        <MetricCard
          title="Facilities"
          value={data.totalFacilities}
          icon={Building2}
          description="Registered"
        />
        <MetricCard
          title="Unresolved Alerts"
          value={data.unresolvedAlerts}
          icon={Bell}
          description="Platform-wide"
          variant={data.unresolvedAlerts > 0 ? "warning" : "default"}
        />
      </div>

      {/* Role breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {data.usersByRole?.map((item) => (
          <Card key={item.role}>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold text-primary">{item.count}</p>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {item.role}s
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Sign-Ups</CardTitle>
              <CardDescription>Newest registered users</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentUsers && data.recentUsers.length > 0 ? (
              <UsersTable users={data.recentUsers.slice(0, 5)} />
            ) : (
              <EmptyState icon={Users} title="No users yet" description="" />
            )}
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Critical Alerts</CardTitle>
              <CardDescription>High-severity safety flags</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/alerts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.criticalAlerts && data.criticalAlerts.length > 0 ? (
              data.criticalAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <AlertBadge severity={alert.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title="No critical alerts"
                description="No unresolved high-severity flags platform-wide."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
