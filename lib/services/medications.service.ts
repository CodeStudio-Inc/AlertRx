import { connectDB } from "@/lib/db/connect";
import { MedicationLogModel } from "@/models/MedicationLog";
import { generateAlertsForMedication, saveAlerts } from "./alerts.service";
import type { ActorContext, AlertPreview, ServiceResult } from "@/lib/types";
import type { MedicationLogInput } from "@/lib/validators/medication.schema";

export interface CreateMedicationResult {
  medicationId: string;
  alerts: AlertPreview[];
}

export async function createMedicationLog(
  input: MedicationLogInput,
  patientUserId: string,
  actor: ActorContext
): Promise<ServiceResult<CreateMedicationResult>> {
  await connectDB();

  // Run alert checks before saving
  const alertPreviews = await generateAlertsForMedication(patientUserId, input);

  const medication = await MedicationLogModel.create({
    patientId: patientUserId,
    createdByUserId: actor.userId,
    medicationName: input.medicationName,
    category: input.category || undefined,
    dosage: input.dosage,
    frequency: input.frequency,
    route: input.route,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    prescribedBy: input.prescribedBy || undefined,
    sourceText: input.sourceText || undefined,
    reason: input.reason || undefined,
    notes: input.notes || undefined,
    status: "active",
  });

  // Persist alerts linked to this medication
  if (alertPreviews.length > 0) {
    await saveAlerts(patientUserId, alertPreviews, {
      relatedMedicationId: medication._id.toString(),
    });
  }

  return {
    success: true,
    data: {
      medicationId: medication._id.toString(),
      alerts: alertPreviews,
    },
  };
}

export async function getActiveMedications(patientUserId: string) {
  await connectDB();
  return MedicationLogModel.find({
    patientId: patientUserId,
    status: "active",
  })
    .sort({ startDate: -1 })
    .lean();
}

export async function getMedicationHistory(patientUserId: string, limit = 20) {
  await connectDB();
  return MedicationLogModel.find({ patientId: patientUserId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getMedicationById(medicationId: string) {
  await connectDB();
  return MedicationLogModel.findById(medicationId).lean();
}

export async function updateMedicationStatus(
  medicationId: string,
  status: "active" | "completed" | "discontinued" | "on_hold",
  actor: ActorContext
): Promise<ServiceResult> {
  await connectDB();
  const med = await MedicationLogModel.findById(medicationId);
  if (!med) return { success: false, error: "Medication not found" };

  // Patients can only update their own medications
  if (
    actor.role === "patient" &&
    med.patientId.toString() !== actor.userId
  ) {
    return { success: false, error: "Unauthorized" };
  }

  med.status = status;
  await med.save();
  return { success: true };
}

/**
 * Get all medications for a patient by user._id or patientProfile._id.
 */
export async function getMedicationsForPatient(patientUserId: string): Promise<ServiceResult<any[]>> {
  await connectDB();
  try {
    const meds = await MedicationLogModel.find({ patientId: patientUserId })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: meds };
  } catch {
    return { success: false, error: "Failed to fetch medications" };
  }
}

// Auto-expire medications whose endDate has passed
export async function autoExpireMedications(): Promise<number> {
  await connectDB();
  const result = await MedicationLogModel.updateMany(
    {
      status: "active",
      endDate: { $lt: new Date() },
    },
    { status: "completed" }
  );
  return result.modifiedCount;
}
