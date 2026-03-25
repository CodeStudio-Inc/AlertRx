"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createPrescription,
  previewPrescriptionAlerts,
  getPrescriptionsForPatient,
  getProviderPrescriptions,
} from "@/lib/services/prescriptions.service";
import { prescriptionSchema } from "@/lib/validators/prescription.schema";
import type { ActorContext } from "@/lib/types";

export async function previewPrescriptionAlertsAction(
  formData: Record<string, any>
) {
  const session = await auth();
  if (!session?.user || !["provider", "admin"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  const parsed = prescriptionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const result = await previewPrescriptionAlerts(parsed.data);
  return { success: true, alerts: result.alerts };
}

export async function createPrescriptionAction(formData: Record<string, any>) {
  const session = await auth();
  if (!session?.user || !["provider", "admin"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  const parsed = prescriptionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
    name: session.user.name ?? undefined,
  };

  const result = await createPrescription(parsed.data, actor);
  if (!result.success) return { error: result.error };

  revalidatePath("/provider/prescriptions");
  revalidatePath("/dashboard/provider");

  return {
    success: true,
    prescriptionId: result.data?.prescriptionId,
    alerts: result.data?.alerts ?? [],
  };
}

export async function getPatientPrescriptionsAction(patientId: string) {
  const session = await auth();
  if (!session?.user) return [];
  return getPrescriptionsForPatient(patientId);
}

export async function getProviderPrescriptionsAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") return [];
  return getProviderPrescriptions(session.user.id);
}
