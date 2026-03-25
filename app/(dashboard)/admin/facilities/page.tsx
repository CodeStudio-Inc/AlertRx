import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllFacilities } from "@/lib/services/providers.service";
import { createFacilityAction } from "@/actions/admin.actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Building2, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Facilities" };

const FACILITY_TYPE_OPTIONS = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "laboratory", label: "Laboratory" },
  { value: "other", label: "Other" },
];

export default async function AdminFacilitiesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const result = await getAllFacilities();
  const facilities = result.data ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facilities</h1>
        <p className="text-muted-foreground text-sm">
          {facilities.length} registered facilit{facilities.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Facility
          </CardTitle>
          <CardDescription>
            Create a new healthcare facility record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFacilityAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="General Hospital"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <select
                name="type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                {FACILITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="City, State"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="+1234567890"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Facility
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Facilities list */}
      {facilities.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {facilities.map((fac: any) => (
            <Card key={fac._id}>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="font-medium">{fac.name}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {fac.type}
                  </Badge>
                </div>
                {fac.location && (
                  <p className="text-xs text-muted-foreground">{fac.location}</p>
                )}
                {fac.contactPhone && (
                  <p className="text-xs text-muted-foreground">
                    {fac.contactPhone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Added {format(new Date(fac.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No facilities yet"
          description="Add the first facility using the form above."
        />
      )}
    </div>
  );
}
