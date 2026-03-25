import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedicationForm } from "@/components/patient/medication-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pill } from "lucide-react";

export const metadata: Metadata = { title: "Log Medication" };

export default async function NewMedicationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log Medication</h1>
        <p className="text-muted-foreground text-sm">
          Adding a new medication will generate adherence logs and run safety
          checks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medication Details
          </CardTitle>
          <CardDescription>
            Fill in the details as prescribed or directed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicationForm patientId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
