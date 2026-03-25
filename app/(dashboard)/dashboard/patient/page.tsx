import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPatientDashboardData } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/shared/metric-card";
import { AdherenceChecklist } from "@/components/patient/adherence-checklist";
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
import { Progress } from "@/components/ui/progress";
import { Pill, TrendingUp, Bell, Plus, Clock } from "lucide-react";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const data = await getPatientDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s your medication summary for today.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/medications/new">
            <Plus className="h-4 w-4" />
            Log Medication
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Medications"
          value={data.activeMedications}
          icon={Pill}
          description="Currently scheduled"
        />
        <MetricCard
          title="Adherence Score"
          value={`${data.adherenceScore}%`}
          icon={TrendingUp}
          description="Last 30 days"
        />
        <MetricCard
          title="Doses Today"
          value={`${data.dosesTakenToday} / ${data.dosesTotalToday}`}
          icon={Clock}
          description="Taken so far"
        />
        <MetricCard
          title="Unresolved Alerts"
          value={data.unresolvedAlerts}
          icon={Bell}
          description="Needs attention"
          variant={data.unresolvedAlerts > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's doses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Doses</CardTitle>
            <CardDescription>Mark each dose as taken or skipped</CardDescription>
          </CardHeader>
          <CardContent>
            <AdherenceChecklist doses={data.todaysDoses ?? []} />
          </CardContent>
        </Card>

        {/* Adherence trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Adherence</CardTitle>
            <CardDescription>Your adherence over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weeklyAdherence && data.weeklyAdherence.length > 0 ? (
              data.weeklyAdherence.map((day) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={
                        day.score >= 80
                          ? "text-green-600"
                          : day.score >= 50
                          ? "text-yellow-600"
                          : "text-destructive"
                      }
                    >
                      {day.score}%
                    </span>
                  </div>
                  <Progress value={day.score} className="h-1.5" />
                </div>
              ))
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No adherence data yet"
                description="Start logging doses to see your weekly trend."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {data.recentAlerts && data.recentAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Alerts</CardTitle>
              <CardDescription>Safety alerts for your medications</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/alerts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <AlertBadge severity={alert.severity} />
                <div className="min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {alert.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
