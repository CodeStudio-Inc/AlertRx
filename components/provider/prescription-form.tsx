"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, Loader2, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertBadge } from "@/components/shared/alert-badge";
import {
  prescriptionSchema,
  type PrescriptionInput,
} from "@/lib/validators/prescription.schema";
import {
  previewPrescriptionAlertsAction,
  createPrescriptionAction,
} from "@/actions/prescription.actions";
import type { AlertPreview } from "@/lib/types";

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "3× daily" },
  { value: "four_times_daily", label: "4× daily" },
  { value: "every_8_hours", label: "Every 8 h" },
  { value: "every_12_hours", label: "Every 12 h" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed (PRN)" },
];

const ROUTE_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "topical", label: "Topical" },
  { value: "injection", label: "Injection" },
  { value: "inhaled", label: "Inhaled" },
  { value: "sublingual", label: "Sublingual" },
  { value: "rectal", label: "Rectal" },
  { value: "ophthalmic", label: "Eye drops" },
  { value: "otic", label: "Ear drops" },
  { value: "nasal", label: "Nasal" },
  { value: "other", label: "Other" },
];

interface PrescriptionFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export function PrescriptionForm({ patientId, onSuccess }: PrescriptionFormProps) {
  const [alertPreviews, setAlertPreviews] = useState<AlertPreview[]>([]);
  const [acknowledgeRequired, setAcknowledgeRequired] = useState(false);
  const [previewPending, startPreview] = useTransition();
  const [submitPending, startSubmit] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrescriptionInput>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId,
      medications: [
        {
          medicationName: "",
          dosage: "",
          frequency: "once_daily",
          route: "oral",
        },
      ],
      issueDate: new Date().toISOString().slice(0, 10),
      acknowledgedAlerts: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  const medications = watch("medications");

  function handlePreview() {
    const meds = medications.filter((m) => m.medicationName.trim());
    if (meds.length === 0) {
      toast.info("Add at least one medication before previewing alerts.");
      return;
    }
    startPreview(async () => {
      const result = await previewPrescriptionAlertsAction({
        patientId,
        medications: meds,
        issueDate: new Date().toISOString().slice(0, 10),
        acknowledgedAlerts: false,
      });
      if (!result.success) {
        toast.error(result.error ?? "Preview failed");
        return;
      }
      const previews = result.alerts ?? [];
      setAlertPreviews(previews);
      if (previews.length > 0) {
        setAcknowledgeRequired(true);
        toast.warning(`${previews.length} alert(s) detected. Please review.`);
      } else {
        toast.success("No safety alerts detected.");
      }
    });
  }

  function onSubmit(data: PrescriptionInput) {
    if (acknowledgeRequired && !data.acknowledgedAlerts) {
      toast.error("You must acknowledge the safety alerts to proceed.");
      return;
    }
    startSubmit(async () => {
      const result = await createPrescriptionAction(data);
      if (!result.success) {
        toast.error(result.error ?? "Failed to create prescription");
      } else {
        toast.success("Prescription created successfully");
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("patientId")} value={patientId} />

      {/* Medications */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Medication {index + 1}</p>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Drug Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Amoxicillin"
                  {...register(`medications.${index}.medicationName`)}
                />
                {errors.medications?.[index]?.medicationName && (
                  <p className="text-xs text-destructive">
                    {errors.medications[index]?.medicationName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Dosage</Label>
                <Input
                  type="text"
                  placeholder="e.g. 500mg"
                  {...register(`medications.${index}.dosage`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select
                  defaultValue="once_daily"
                  onValueChange={(v) =>
                    setValue(`medications.${index}.frequency`, v as any, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-1.5">
                <Label>Route</Label>
                <Select
                  defaultValue="oral"
                  onValueChange={(v) =>
                    setValue(`medications.${index}.route`, v as any, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-1.5">
                <Label>Duration (optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. 7 days"
                  {...register(`medications.${index}.duration`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Route Notes (optional)</Label>
                <Input type="text" placeholder="e.g. before meals" disabled />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Instructions (optional)</Label>
              <Input
                type="text"
                placeholder="Take with food, avoid alcohol, etc."
                {...register(`medications.${index}.instructions`)}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() =>
            append({
              medicationName: "",
              dosage: "",
              frequency: "once_daily",
              route: "oral",
            })
          }
        >
          <PlusCircle className="h-4 w-4" />
          Add Another Medication
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input id="issueDate" type="date" {...register("issueDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Prescription Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Additional instructions for pharmacist or patient"
            {...register("notes")}
          />
        </div>
      </div>

      {/* Alert Preview */}
      {alertPreviews.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-700" />
            <p className="text-sm font-medium text-yellow-800">
              Safety Alerts — Review Required
            </p>
          </div>
          {alertPreviews.map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertBadge severity={alert.severity} />
              <p className="text-xs text-yellow-700">{alert.description}</p>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="acknowledgedAlerts"
              onCheckedChange={(checked) =>
                setValue("acknowledgedAlerts", !!checked)
              }
            />
            <Label htmlFor="acknowledgedAlerts" className="text-xs cursor-pointer">
              I have reviewed and acknowledge these safety alerts
            </Label>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={handlePreview}
          disabled={previewPending}
        >
          {previewPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          Preview Alerts
        </Button>

        <Button
          type="submit"
          className="flex-1 gap-2"
          disabled={submitPending}
        >
          {submitPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {submitPending ? "Creating..." : "Create Prescription"}
        </Button>
      </div>
    </form>
  );
}
