import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPatientSummary } from "@/lib/services/patients.service";
import { getMedicationsForPatient } from "@/lib/services/medications.service";
import { MedicationCard } from "@/components/patient/medication-card";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, FileText, Pill, Bell, User } from "lucide-react";

export const metadata: Metadata = { title: "Patient Details" };

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  const session = await auth();
  if (
    !session?.user ||
    !["provider", "pharmacist", "admin"].includes(session.user.role)
  ) {
    redirect("/login");
  }

  const [summaryResult, medsResult] = await Promise.all([
    getPatientSummary(patientId),
    getMedicationsForPatient(patientId),
  ]);

  if (!summaryResult) notFound();

  const patient = summaryResult;
  const medications = medsResult.data ?? [];
  const active = medications.filter((m) => m.status === "active");

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${session.user.role}/search`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">
            {patient.patientId}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5 space-y-2">
            <p className="text-xs text-muted-foreground">Adherence Score</p>
            <div className="flex items-center gap-2">
              <Progress value={patient.adherenceScore} className="flex-1" />
              <span
                className={`text-sm font-bold ${
                  (patient.adherenceScore ?? 0) >= 80
                    ? "text-green-600"
                    : (patient.adherenceScore ?? 0) >= 50
                    ? "text-yellow-600"
                    : "text-destructive"
                }`}
              >
                {patient.adherenceScore ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Active Medications</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {patient.activeMedications}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Unresolved Alerts</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                (patient.unresolvedAlerts ?? 0) > 0 ? "text-destructive" : "text-primary"
              }`}
            >
              {patient.unresolvedAlerts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link href={`/provider/prescriptions/new?patientId=${patientId}`}>
            <FileText className="h-4 w-4" />
            New Prescription
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="medications">
        <TabsList>
          <TabsTrigger value="medications">
            Medications ({active.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({patient.unresolvedAlerts})
          </TabsTrigger>
          <TabsTrigger value="info">Patient Info</TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="mt-4">
          {active.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {active.map((med) => (
                <MedicationCard
                  key={med._id?.toString()}
                  id={med._id?.toString() ?? ""}
                  drugName={med.drugName}
                  dosage={med.dosage}
                  frequency={med.frequency}
                  routeOfAdministration={med.routeOfAdministration}
                  startDate={med.startDate?.toString() ?? ""}
                  endDate={med.endDate?.toString()}
                  indication={med.indication}
                  status={med.status as any}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Pill}
              title="No active medications"
              description="This patient has no active medications logged."
            />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          {(patient as any).recentAlerts && (patient as any).recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {(patient as any).recentAlerts.map((alert: any) => (
                <div
                  key={alert._id.toString()}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <AlertBadge severity={alert.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{alert.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {alert.type.replace(/_/g, " ")} &bull;{" "}
                      {format(new Date(alert.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No alerts"
              description="No unresolved alerts for this patient."
            />
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{patient.phone}</p>
                </div>
                {patient.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{patient.email}</p>
                  </div>
                )}
                {(patient as any).dateOfBirth && (
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p>{format(new Date((patient as any).dateOfBirth), "MMM d, yyyy")}</p>
                  </div>
                )}
                {patient.gender && (
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="capitalize">{patient.gender.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>
              {(patient as any).allergies && (patient as any).allergies.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).allergies.map((a: string) => (
                      <Badge key={a} variant="destructive" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(patient as any).chronicConditions && (patient as any).chronicConditions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Chronic Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).chronicConditions.map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
