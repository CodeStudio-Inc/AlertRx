"use client";

import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, Loader2, Pill } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  medicationLogSchema,
  type MedicationLogInput,
} from "@/lib/validators/medication.schema";
import { createMedicationAction } from "@/actions/medication.actions";
import { AlertBadge } from "@/components/shared/alert-badge";
import type { AlertPreview } from "@/lib/types";

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "four_times_daily", label: "Four times daily" },
  { value: "every_6_hours", label: "Every 6 hours" },
  { value: "every_8_hours", label: "Every 8 hours" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed (PRN)" },
];

const ROUTE_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "intravenous", label: "Intravenous (IV)" },
  { value: "intramuscular", label: "Intramuscular (IM)" },
  { value: "subcutaneous", label: "Subcutaneous" },
  { value: "topical", label: "Topical" },
  { value: "inhalation", label: "Inhalation" },
  { value: "sublingual", label: "Sublingual" },
  { value: "rectal", label: "Rectal" },
  { value: "ophthalmic", label: "Ophthalmic (Eye)" },
  { value: "otic", label: "Otic (Ear)" },
];

interface MedicationFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export function MedicationForm({ patientId, onSuccess }: MedicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [alerts, setAlerts] = useState<AlertPreview[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MedicationLogInput>({
    resolver: zodResolver(medicationLogSchema),
    defaultValues: {
      patientId,
      frequency: "once_daily",
      routeOfAdministration: "oral",
    },
  });

  function onSubmit(data: MedicationLogInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      const result = await createMedicationAction(formData);
      if (!result.success) {
        toast.error(result.error ?? "Failed to save medication");
        return;
      }
      if (result.data?.alerts && result.data.alerts.length > 0) {
        setAlerts(result.data.alerts);
        toast.warning(
          `Medication saved with ${result.data.alerts.length} alert(s). Review below.`
        );
      } else {
        toast.success("Medication logged successfully");
      }
      reset({ patientId, frequency: "once_daily", routeOfAdministration: "oral" });
      onSuccess?.();
    });
  }

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
          <p className="text-sm font-medium text-yellow-800">
            Safety Alerts Generated
          </p>
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertBadge severity={alert.severity} />
              <p className="text-xs text-yellow-700">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("patientId")} value={patientId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="drugName">Drug Name</Label>
            <Input
              id="drugName"
              type="text"
              placeholder="e.g. Amoxicillin"
              {...register("drugName")}
            />
            {errors.drugName && (
              <p className="text-xs text-destructive">{errors.drugName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              type="text"
              placeholder="e.g. 500mg"
              {...register("dosage")}
            />
            {errors.dosage && (
              <p className="text-xs text-destructive">{errors.dosage.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              defaultValue="once_daily"
              onValueChange={(v) =>
                setValue("frequency", v as MedicationLogInput["frequency"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-xs text-destructive">
                {errors.frequency.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="routeOfAdministration">Route</Label>
            <Select
              defaultValue="oral"
              onValueChange={(v) =>
                setValue(
                  "routeOfAdministration",
                  v as MedicationLogInput["routeOfAdministration"],
                  { shouldValidate: true }
                )
              }
            >
              <SelectTrigger id="routeOfAdministration">
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className="text-xs text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date (optional)</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="indication">Indication (optional)</Label>
          <Input
            id="indication"
            type="text"
            placeholder="Reason for this medication"
            {...register("indication")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Additional instructions or notes"
            rows={3}
            {...register("notes")}
          />
        </div>

        <Button type="submit" className="w-full gap-2" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pill className="h-4 w-4" />
          )}
          {isPending ? "Saving..." : "Log Medication"}
        </Button>
      </form>
    </div>
  );
}
