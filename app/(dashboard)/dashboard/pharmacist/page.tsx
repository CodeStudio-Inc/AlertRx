import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPharmacistDashboardData } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/shared/metric-card";
import { PatientSummaryCard } from "@/components/shared/patient-summary-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Search,
  ClipboardList,
  Users,
  AlertTriangle,
  Plus,
  Flag,
} from "lucide-react";

export const metadata: Metadata = { title: "Pharmacist Dashboard" };

export default async function PharmacistDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "pharmacist") redirect("/login");

  const data = await getPharmacistDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pharmacist Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Dispense records and patient verification.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/pharmacist/search">
              <Search className="h-4 w-4" />
              Find Patient
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/pharmacist/dispense/new">
              <Plus className="h-4 w-4" />
              New Dispense
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Dispenses Today"
          value={data.dispensesToday}
          icon={ClipboardList}
          description="Records created today"
        />
        <MetricCard
          title="Total Dispenses"
          value={data.totalDispenses}
          icon={ClipboardList}
          description="All time"
        />
        <MetricCard
          title="Patients Served"
          value={data.patientsServed}
          icon={Users}
          description="Unique patients"
        />
        <MetricCard
          title="Flagged Reviews"
          value={data.flaggedForReview}
          icon={Flag}
          description="Needs follow-up"
          variant={data.flaggedForReview > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent dispense records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Dispenses</CardTitle>
              <CardDescription>Latest dispense records</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pharmacist/records">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentDispenses && data.recentDispenses.length > 0 ? (
              <div className="divide-y">
                {data.recentDispenses.slice(0, 5).map((record) => (
                  <div
                    key={record._id.toString()}
                    className="flex items-center justify-between py-3 gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {record.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.medicationName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {record.flaggedForReview ? (
                        <Badge variant="destructive" className="text-xs mb-0.5">
                          Flagged
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs mb-0.5">
                          OK
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.dispensedAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No dispenses yet"
                description="Create a dispense record after verifying a prescription."
              />
            )}
          </CardContent>
        </Card>

        {/* Flagged patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flagged Patients</CardTitle>
            <CardDescription>Patients with high-risk dispenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.flaggedPatients && data.flaggedPatients.length > 0 ? (
              data.flaggedPatients.slice(0, 4).map((patient) => (
                <PatientSummaryCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.name}
                  patientId={patient.patientId}
                  phone={patient.phone}
                  adherenceScore={patient.adherenceScore}
                  activeMedications={patient.activeMedications}
                  unresolvedAlerts={patient.unresolvedAlerts}
                  compact
                />
              ))
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="No flagged patients"
                description="No high-risk cases at this time."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
