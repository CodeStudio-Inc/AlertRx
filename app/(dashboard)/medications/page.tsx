import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getMedicationsForPatient } from "@/lib/services/medications.service";
import { MedicationCard } from "@/components/patient/medication-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pill } from "lucide-react";

export const metadata: Metadata = { title: "My Medications" };

export default async function MedicationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const result = await getMedicationsForPatient(session.user.id);
  const medications = result.data ?? [];

  const active = medications.filter((m) => m.status === "active");
  const past = medications.filter((m) => m.status !== "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Medications</h1>
          <p className="text-muted-foreground text-sm">
            {active.length} active medication{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/medications/new">
            <Plus className="h-4 w-4" />
            Log Medication
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {active.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              description="Log your first medication to begin tracking adherence."
              action={
                <Button asChild size="sm">
                  <Link href="/medications/new">Log Medication</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {past.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((med) => (
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
              title="No past medications"
              description="Completed and discontinued medications will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
