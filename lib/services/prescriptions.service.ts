import { connectDB } from "@/lib/db/connect";
import { PrescriptionModel } from "@/models/Prescription";
import { generateAlertsForMedication, saveAlerts } from "./alerts.service";
import type { ActorContext, AlertPreview, ServiceResult } from "@/lib/types";
import type { PrescriptionInput } from "@/lib/validators/prescription.schema";

export interface PrescriptionPreviewResult {
  alerts: AlertPreview[];
}

/**
 * Preview alerts before creating a prescription (no data saved).
 * Called when provider fills out the form and wants to see warnings.
 */
export async function previewPrescriptionAlerts(
  input: PrescriptionInput
): Promise<PrescriptionPreviewResult> {
  const allAlerts: AlertPreview[] = [];

  for (const med of input.medications) {
    const medAlerts = await generateAlertsForMedication(input.patientId, {
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequency: med.frequency as any,
      route: med.route as any,
      startDate: input.issueDate,
    });
    allAlerts.push(...medAlerts);
  }

  return { alerts: allAlerts };
}

export async function createPrescription(
  input: PrescriptionInput,
  actor: ActorContext
): Promise<ServiceResult<{ prescriptionId: string; alerts: AlertPreview[] }>> {
  if (!["provider", "admin"].includes(actor.role)) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  // Run alerts for each medication
  const allAlerts: AlertPreview[] = [];
  for (const med of input.medications) {
    const alerts = await generateAlertsForMedication(input.patientId, {
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequency: med.frequency as any,
      route: med.route as any,
      startDate: input.issueDate,
    });
    allAlerts.push(...alerts);
  }

  const prescription = await PrescriptionModel.create({
    patientId: input.patientId,
    providerId: actor.userId,
    medications: input.medications,
    notes: input.notes || undefined,
    issueDate: new Date(input.issueDate),
    status: "active",
    acknowledgedAlerts: input.acknowledgedAlerts,
  });

  // Persist alerts
  if (allAlerts.length > 0) {
    const alertIds = await saveAlerts(input.patientId, allAlerts, {
      relatedPrescriptionId: prescription._id.toString(),
    });
    await PrescriptionModel.findByIdAndUpdate(prescription._id, {
      alertIds,
    });
  }

  return {
    success: true,
    data: {
      prescriptionId: prescription._id.toString(),
      alerts: allAlerts,
    },
  };
}

export async function getPrescriptionsForPatient(patientId: string, limit = 10) {
  await connectDB();
  return PrescriptionModel.find({ patientId })
    .sort({ issueDate: -1 })
    .limit(limit)
    .populate("providerId", "name")
    .lean();
}

export async function getPrescriptionById(prescriptionId: string) {
  await connectDB();
  return PrescriptionModel.findById(prescriptionId)
    .populate("patientId", "name phone")
    .populate("providerId", "name")
    .lean();
}

export async function getProviderPrescriptions(providerId: string, limit = 20) {
  await connectDB();
  return PrescriptionModel.find({ providerId })
    .sort({ issueDate: -1 })
    .limit(limit)
    .populate("patientId", "name phone")
    .lean();
}
