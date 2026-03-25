"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  providerOnboardingSchema,
  type ProviderOnboardingInput,
} from "@/lib/validators/provider.schema";
import { completeProviderOnboardingAction } from "@/actions/patient.actions";

const PROFESSION_OPTIONS = [
  { value: "doctor", label: "Doctor (MD / MBBS)" },
  { value: "nurse", label: "Nurse" },
  { value: "nurse_practitioner", label: "Nurse Practitioner" },
  { value: "physician_assistant", label: "Physician Assistant" },
  { value: "specialist", label: "Specialist" },
  { value: "other", label: "Other" },
];

const FACILITY_TYPE_OPTIONS = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "laboratory", label: "Laboratory" },
  { value: "other", label: "Other" },
];

export function OnboardingProviderForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderOnboardingInput>({
    resolver: zodResolver(providerOnboardingSchema),
  });

  function onSubmit(data: ProviderOnboardingInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      const result = await completeProviderOnboardingAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profession">Profession</Label>
          <Select
            onValueChange={(v) =>
              setValue(
                "profession",
                v as ProviderOnboardingInput["profession"],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger id="profession">
              <SelectValue placeholder="Select profession" />
            </SelectTrigger>
            <SelectContent>
              {PROFESSION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.profession && (
            <p className="text-xs text-destructive">
              {errors.profession.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="licenseNumber">License / Registration Number</Label>
          <Input
            id="licenseNumber"
            type="text"
            placeholder="e.g. MD-2024-00123"
            {...register("licenseNumber")}
          />
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">
              {errors.licenseNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="facilityName">Facility Name</Label>
        <Input
          id="facilityName"
          type="text"
          placeholder="General Hospital / City Clinic"
          {...register("facilityName")}
        />
        {errors.facilityName && (
          <p className="text-xs text-destructive">
            {errors.facilityName.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="facilityType">Facility Type</Label>
          <Select
            onValueChange={(v) =>
              setValue(
                "facilityType",
                v as ProviderOnboardingInput["facilityType"],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger id="facilityType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FACILITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.facilityType && (
            <p className="text-xs text-destructive">
              {errors.facilityType.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="facilityLocation">Facility Location (optional)</Label>
          <Input
            id="facilityLocation"
            type="text"
            placeholder="City, State / Country"
            {...register("facilityLocation")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Stethoscope className="h-4 w-4" />
        )}
        {isPending ? "Saving profile..." : "Complete Setup"}
      </Button>
    </form>
  );
}
