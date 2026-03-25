import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DispenseForm } from "@/components/pharmacist/dispense-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = { title: "Record Dispense" };

interface PageProps {
  searchParams: Promise<{ patientId?: string; prescriptionId?: string }>;
}

export default async function NewDispensePage({ searchParams }: PageProps) {
  const { patientId, prescriptionId } = await searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "pharmacist") redirect("/login");

  if (!patientId) {
    redirect("/pharmacist/search");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Record Dispense</h1>
        <p className="text-muted-foreground text-sm">
          Log a medication dispense event for this patient.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Dispense Details
          </CardTitle>
          <CardDescription>
            All fields except notes are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DispenseForm patientId={patientId} prescriptionId={prescriptionId} />
        </CardContent>
      </Card>
    </div>
  );
}
