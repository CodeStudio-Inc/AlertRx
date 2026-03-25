import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, AlertCircle, Pill, Activity } from "lucide-react";
import type { PatientSummary } from "@/lib/types";
import { getAdherenceLabel, getAdherenceColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface PatientSummaryCardProps {
  patient?: PatientSummary;
  href?: string;
  id?: string;
  name?: string;
  patientId?: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  activeMedications?: number;
  adherenceScore?: number;
  unresolvedAlerts?: number;
  lastActivity?: string | Date;
  compact?: boolean;
}

export function PatientSummaryCard({
  patient,
  href,
  name,
  patientId,
  phone,
  age,
  gender,
  activeMedications,
  adherenceScore,
  unresolvedAlerts,
}: PatientSummaryCardProps) {
  const resolvedPatient: PatientSummary =
    patient ??
    ({
      id: "",
      patientId: patientId ?? "",
      name: name ?? "Unknown Patient",
      phone: phone ?? "",
      age,
      gender: gender as PatientSummary["gender"],
      activeMedications: activeMedications ?? 0,
      unresolvedAlerts: unresolvedAlerts ?? 0,
      adherenceScore,
      recentPrescriptions: 0,
    } as PatientSummary);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {resolvedPatient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{resolvedPatient.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {resolvedPatient.patientId}
              </p>
            </div>
          </div>
          {resolvedPatient.unresolvedAlerts > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertCircle className="h-3 w-3" />
              {resolvedPatient.unresolvedAlerts} alert{resolvedPatient.unresolvedAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{resolvedPatient.phone}</span>
          {resolvedPatient.age && (
            <>
              <span className="text-border">•</span>
              <span>
                {resolvedPatient.age} yrs
                {resolvedPatient.gender ? `, ${resolvedPatient.gender}` : ""}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Pill className="h-3.5 w-3.5 text-blue-500" />
            <span>
              <span className="font-medium text-foreground">
                {resolvedPatient.activeMedications}
              </span>{" "}
              active meds
            </span>
          </div>
          {resolvedPatient.adherenceScore !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-green-500" />
              <span>
                <span
                  className={cn(
                    "font-medium",
                    getAdherenceColor(resolvedPatient.adherenceScore)
                  )}
                >
                  {resolvedPatient.adherenceScore}%
                </span>{" "}
                adherence
              </span>
            </div>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="block text-center text-xs text-primary hover:underline mt-1"
          >
            View full profile →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
