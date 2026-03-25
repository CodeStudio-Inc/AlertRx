import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, AlertCircle, Pill, Activity } from "lucide-react";
import type { PatientSummary } from "@/lib/types";
import { getAdherenceLabel, getAdherenceColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface PatientSummaryCardProps {
  patient: PatientSummary;
  href?: string;
}

export function PatientSummaryCard({ patient, href }: PatientSummaryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{patient.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {patient.patientId}
              </p>
            </div>
          </div>
          {patient.unresolvedAlerts > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertCircle className="h-3 w-3" />
              {patient.unresolvedAlerts} alert{patient.unresolvedAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{patient.phone}</span>
          {patient.age && (
            <>
              <span className="text-border">•</span>
              <span>
                {patient.age} yrs
                {patient.gender ? `, ${patient.gender}` : ""}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Pill className="h-3.5 w-3.5 text-blue-500" />
            <span>
              <span className="font-medium text-foreground">
                {patient.activeMedications}
              </span>{" "}
              active meds
            </span>
          </div>
          {patient.adherenceScore !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-green-500" />
              <span>
                <span
                  className={cn(
                    "font-medium",
                    getAdherenceColor(patient.adherenceScore)
                  )}
                >
                  {patient.adherenceScore}%
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
