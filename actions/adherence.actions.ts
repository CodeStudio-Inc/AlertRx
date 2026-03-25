"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  markDose,
  getTodaysDoses,
  getAdherenceHistory,
  getAdherenceScore,
} from "@/lib/services/adherence.service";
import { markDoseSchema } from "@/lib/validators/adherence.schema";
import type { ActorContext } from "@/lib/types";
import { connectDB } from "@/lib/db/connect";
import { DispenseRecordModel } from "@/models/DispenseRecord";
import { dispenseRecordSchema } from "@/lib/validators/adherence.schema";

export async function markDoseAction(formData: {
  adherenceLogId: string;
  status: "taken" | "missed" | "skipped";
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = markDoseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
  };

  const result = await markDose(parsed.data, actor);
  revalidatePath("/patient/adherence");
  revalidatePath("/dashboard/patient");
  return result;
}

export async function getTodaysDosesAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") return [];
  return getTodaysDoses(session.user.id);
}

export async function getAdherenceHistoryAction(daysBack = 30) {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") return [];
  return getAdherenceHistory(session.user.id, daysBack);
}

export async function createDispenseRecordAction(formData: Record<string, any>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pharmacist") {
    return { error: "Unauthorized" };
  }

  const parsed = dispenseRecordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  await connectDB();

  await DispenseRecordModel.create({
    patientId: parsed.data.patientId,
    pharmacistId: session.user.id,
    prescriptionId: parsed.data.prescriptionId || undefined,
    medicationName: parsed.data.medicationName,
    quantity: parsed.data.quantity,
    dispensedAt: new Date(parsed.data.dispensedAt),
    notes: parsed.data.notes || undefined,
    flaggedForReview: parsed.data.flaggedForReview,
    flagReason: parsed.data.flagReason || undefined,
  });

  revalidatePath("/pharmacist/records");
  return { success: true };
}
