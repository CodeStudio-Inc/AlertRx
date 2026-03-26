"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { dispenseRecordSchema, type DispenseRecordInput } from "@/lib/validators/adherence.schema";
import { createDispenseRecordAction } from "@/actions/adherence.actions";

interface DispenseFormProps {
  patientId: string;
  prescriptionId?: string;
}

export function DispenseForm({ patientId, prescriptionId }: DispenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DispenseRecordInput>({
    resolver: zodResolver(dispenseRecordSchema),
    defaultValues: {
      patientId,
      prescriptionId,
      dispensedAt: new Date().toISOString().slice(0, 10),
      quantity: "",
      flaggedForReview: false,
    },
  });

  const flagged = watch("flaggedForReview");

  function onSubmit(data: DispenseRecordInput) {
    startTransition(async () => {
      const result = await createDispenseRecordAction(data);
      if (!result.success) {
        toast.error(result.error ?? "Failed to create record");
      } else {
        toast.success("Dispense record created");
        router.push("/pharmacist/records");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("patientId")} />
      {prescriptionId && <input type="hidden" {...register("prescriptionId")} />}

      <div className="space-y-1.5">
        <Label htmlFor="medicationName">Medication Dispensed</Label>
        <Input
          id="medicationName"
          type="text"
          placeholder="e.g. Amoxicillin 500mg capsules"
          {...register("medicationName")}
        />
        {errors.medicationName && (
          <p className="text-xs text-destructive">
            {errors.medicationName.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="text"
            placeholder="30"
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dispensedAt">Dispensed On</Label>
          <Input id="dispensedAt" type="date" {...register("dispensedAt")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Pharmacist Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Counselling provided, special instructions given, etc."
          {...register("notes")}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Flag for Review</p>
          <p className="text-xs text-muted-foreground">
            Mark this dispense as requiring follow-up
          </p>
        </div>
        <Switch
          checked={!!flagged}
          onCheckedChange={(v) => setValue("flaggedForReview", v)}
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ClipboardList className="h-4 w-4" />
        )}
        {isPending ? "Saving..." : "Record Dispense"}
      </Button>
    </form>
  );
}
