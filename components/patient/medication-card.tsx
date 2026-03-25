import { format } from "date-fns";
import { Pill, Clock, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MedicationCardProps {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  routeOfAdministration: string;
  startDate: string;
  endDate?: string | null;
  indication?: string | null;
  adherenceScore?: number;
  status: "active" | "completed" | "discontinued" | "on_hold";
}

const FREQUENCY_LABELS: Record<string, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "3× daily",
  four_times_daily: "4× daily",
  every_6_hours: "Every 6 h",
  every_8_hours: "Every 8 h",
  weekly: "Weekly",
  as_needed: "As needed",
};

const STATUS_VARIANT = {
  active: "default",
  completed: "secondary",
  discontinued: "destructive",
  on_hold: "outline",
} as const;

export function MedicationCard({
  id,
  drugName,
  dosage,
  frequency,
  routeOfAdministration,
  startDate,
  endDate,
  indication,
  adherenceScore,
  status,
}: MedicationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Pill className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold leading-tight">{drugName}</p>
            <p className="text-xs text-muted-foreground">{dosage}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[status]} className="capitalize shrink-0">
          {status.replace("_", " ")}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{FREQUENCY_LABELS[frequency] ?? frequency}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="capitalize">{routeOfAdministration}</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(startDate), "MMM d, yyyy")}
              {endDate
                ? ` → ${format(new Date(endDate), "MMM d, yyyy")}`
                : " (ongoing)"}
            </span>
          </div>
        </div>

        {indication && (
          <p className="text-xs text-muted-foreground italic truncate">
            For: {indication}
          </p>
        )}

        {adherenceScore !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Adherence</span>
              <span
                className={
                  adherenceScore >= 80
                    ? "text-green-600"
                    : adherenceScore >= 50
                    ? "text-yellow-600"
                    : "text-destructive"
                }
              >
                {adherenceScore}%
              </span>
            </div>
            <Progress value={adherenceScore} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/medications/${id}`}
          className="w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline"
        >
          View details
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
