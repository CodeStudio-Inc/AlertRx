import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrescriptionForm } from "@/components/provider/prescription-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "New Prescription" };

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewPrescriptionPage({ searchParams }: PageProps) {
  const { patientId } = await searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") redirect("/login");

  if (!patientId) {
    redirect("/provider/search");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Prescription</h1>
        <p className="text-muted-foreground text-sm">
          Preview safety alerts before finalizing the prescription.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prescription Details
          </CardTitle>
          <CardDescription>
            Add one or more medications, then preview safety alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionForm patientId={patientId} />
        </CardContent>
      </Card>
    </div>
  );
}
