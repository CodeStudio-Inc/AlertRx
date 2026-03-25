"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { markDoseAction } from "@/actions/adherence.actions";

interface Dose {
  adherenceLogId: string;
  drugName: string;
  dosage: string;
  scheduledAt: string;
  status: "pending" | "taken" | "missed" | "skipped";
}

interface AdherenceChecklistProps {
  doses: Dose[];
  date?: Date;
}

const STATUS_CONFIG = {
  taken: { label: "Taken", icon: CheckCircle2, className: "text-green-600" },
  missed: { label: "Missed", icon: XCircle, className: "text-destructive" },
  skipped: { label: "Skipped", icon: XCircle, className: "text-yellow-600" },
  pending: { label: "Pending", icon: Clock, className: "text-muted-foreground" },
};

function DoseItem({ dose }: { dose: Dose }) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(dose.status);

  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;

  function mark(status: "taken" | "skipped") {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("adherenceLogId", dose.adherenceLogId);
      formData.append("status", status);
      if (status === "taken") formData.append("takenAt", new Date().toISOString());
      const result = await markDoseAction(formData);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update dose");
      } else {
        setCurrentStatus(status);
        toast.success(status === "taken" ? "Dose marked as taken" : "Dose skipped");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon className={`h-5 w-5 shrink-0 ${config.className}`} />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{dose.drugName}</p>
          <p className="text-xs text-muted-foreground">
            {dose.dosage} &bull;{" "}
            {format(new Date(dose.scheduledAt), "h:mm a")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {currentStatus === "pending" ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => mark("skipped")}
            >
              Skip
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={isPending}
              onClick={() => mark("taken")}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Take
            </Button>
          </>
        ) : (
          <Badge
            variant={
              currentStatus === "taken"
                ? "default"
                : currentStatus === "missed"
                ? "destructive"
                : "secondary"
            }
            className="text-xs capitalize"
          >
            {config.label}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function AdherenceChecklist({ doses, date }: AdherenceChecklistProps) {
  const displayDate = date ?? new Date();

  if (doses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No doses scheduled for today.</p>
      </div>
    );
  }

  const taken = doses.filter((d) => d.status === "taken").length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          {format(displayDate, "EEEE, MMMM d")}
        </p>
        <Badge variant="outline" className="text-xs">
          {taken} / {doses.length} taken
        </Badge>
      </div>

      <div className="divide-y">
        {doses.map((dose, i) => (
          <DoseItem key={dose.adherenceLogId ?? i} dose={dose} />
        ))}
      </div>
    </div>
  );
}
