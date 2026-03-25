import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientSearch } from "@/components/provider/patient-search";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Patient Search — Pharmacist" };

export default async function PharmacistSearchPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "pharmacist") redirect("/login");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patient Search</h1>
        <p className="text-muted-foreground text-sm">
          Search by name, phone, or patient ID to verify prescriptions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
          <CardDescription>
            Results update as you type. Minimum 2 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSearch />
        </CardContent>
      </Card>
    </div>
  );
}
