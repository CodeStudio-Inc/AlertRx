"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createMedicationLog,
  getActiveMedications,
  getMedicationHistory,
  updateMedicationStatus,
} from "@/lib/services/medications.service";
import { medicationLogSchema } from "@/lib/validators/medication.schema";
import type { ActorContext } from "@/lib/types";

export async function createMedicationAction(formData: Record<string, any>) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = medicationLogSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
    name: session.user.name ?? undefined,
  };

  // Providers log on behalf of a patient; patients log for themselves
  const patientId =
    session.user.role === "patient"
      ? session.user.id
      : (formData.patientId as string);

  if (!patientId) return { error: "Patient ID is required" };

  const result = await createMedicationLog(parsed.data, patientId, actor);
  if (!result.success) return { error: result.error };

  revalidatePath("/medications");
  revalidatePath("/dashboard/patient");

  return {
    success: true,
    medicationId: result.data?.medicationId,
    alerts: result.data?.alerts ?? [],
  };
}

export async function getActiveMedicationsAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") return [];
  return getActiveMedications(session.user.id);
}

export async function getMedicationHistoryAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") return [];
  return getMedicationHistory(session.user.id);
}

export async function updateMedicationStatusAction(
  medicationId: string,
  status: "active" | "completed" | "discontinued" | "on_hold"
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
  };

  const result = await updateMedicationStatus(medicationId, status, actor);
  revalidatePath("/medications");
  return result;
}
