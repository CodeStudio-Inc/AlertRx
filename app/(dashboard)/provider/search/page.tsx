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

export const metadata: Metadata = { title: "Find Patient" };

export default async function ProviderSearchPage() {
  const session = await auth();
  if (!session?.user || !["provider", "pharmacist", "admin"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patient Search</h1>
        <p className="text-muted-foreground text-sm">
          Search by name, phone number, or patient ID.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
          <CardDescription>
            Minimum 2 characters required. Results update as you type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSearch />
        </CardContent>
      </Card>
    </div>
  );
}
