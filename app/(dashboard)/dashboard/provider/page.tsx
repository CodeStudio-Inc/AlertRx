import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getProviderDashboardData } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/shared/metric-card";
import { PatientSummaryCard } from "@/components/shared/patient-summary-card";
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
import { Users, FileText, Bell, Search, Plus, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Provider Dashboard" };

export default async function ProviderDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") redirect("/login");

  const data = await getProviderDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, Dr. {session.user.name?.split(" ").slice(-1)[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Your patients and prescription overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/provider/search">
              <Search className="h-4 w-4" />
              Find Patient
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/provider/prescriptions/new">
              <Plus className="h-4 w-4" />
              New Prescription
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="My Patients"
          value={data.totalPatients}
          icon={Users}
          description="Under your care"
        />
        <MetricCard
          title="Prescriptions"
          value={data.totalPrescriptions}
          icon={FileText}
          description="All time"
        />
        <MetricCard
          title="Pending Alerts"
          value={data.pendingAlerts}
          icon={Bell}
          description="Unresolved"
          variant={data.pendingAlerts > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Low Adherence"
          value={data.lowAdherenceCount}
          icon={AlertTriangle}
          description="Below 70%"
          variant={data.lowAdherenceCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Patients</CardTitle>
              <CardDescription>Last updated activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/patients">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentPatients && data.recentPatients.length > 0 ? (
              data.recentPatients.slice(0, 5).map((patient) => (
                <PatientSummaryCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.name}
                  patientId={patient.patientId}
                  phone={patient.phone}
                  email={patient.email}
                  adherenceScore={patient.adherenceScore}
                  activeMedications={patient.activeMedications}
                  unresolvedAlerts={patient.unresolvedAlerts}
                  lastActivity={patient.lastActivity}
                  compact
                />
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description="Search for a patient to get started."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/provider/search">Find Patient</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Safety Alerts</CardTitle>
              <CardDescription>Unresolved flags for your patients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/alerts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAlerts && data.recentAlerts.length > 0 ? (
              data.recentAlerts.slice(0, 5).map((alert) => (
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
              ))
            ) : (
              <EmptyState
                icon={Bell}
                title="No pending alerts"
                description="All safety flags have been resolved."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
