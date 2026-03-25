/**
 * alerts.service.ts
 *
 * Rule-based alert engine. Isolated and portable to NestJS.
 * Each rule is a pure function that takes patient context and returns AlertPreviews.
 */

import { connectDB } from "@/lib/db/connect";
import { AlertModel } from "@/models/Alert";
import { MedicationLogModel } from "@/models/MedicationLog";
import { PatientProfileModel } from "@/models/PatientProfile";
import type { AlertPreview, ActorContext } from "@/lib/types";
import type { MedicationLogInput } from "@/lib/validators/medication.schema";
import type { Types } from "mongoose";

// Medication categories considered antibiotics for overlap checking
const ANTIBIOTIC_KEYWORDS = [
  "antibiotic",
  "amoxicillin",
  "azithromycin",
  "ciprofloxacin",
  "clarithromycin",
  "doxycycline",
  "metronidazole",
  "trimethoprim",
  "cephalexin",
  "erythromycin",
  "penicillin",
  "ampicillin",
  "clindamycin",
  "vancomycin",
];

const LONG_DURATION_DAYS = 90;

function isAntibiotic(medName: string, category?: string): boolean {
  const haystack = `${medName} ${category ?? ""}`.toLowerCase();
  return ANTIBIOTIC_KEYWORDS.some((kw) => haystack.includes(kw));
}

/**
 * Generate rule-based alert previews for a new medication being logged.
 * Called before saving so alerts can be shown in UI first.
 */
export async function generateAlertsForMedication(
  patientUserId: string,
  input: MedicationLogInput
): Promise<AlertPreview[]> {
  await connectDB();
  const alerts: AlertPreview[] = [];

  // 1. Duplicate / same-drug-active check
  const activeMeds = await MedicationLogModel.find({
    patientId: patientUserId,
    status: "active",
  }).lean();

  const duplicate = activeMeds.find(
    (m) =>
      m.medicationName.toLowerCase().includes(input.medicationName.toLowerCase()) ||
      input.medicationName.toLowerCase().includes(m.medicationName.toLowerCase())
  );

  if (duplicate) {
    alerts.push({
      type: "same_drug_active",
      severity: "warning",
      title: "Same Drug Already Active",
      description: `Patient already has an active record for "${duplicate.medicationName}". Please verify this is intentional.`,
    });
  }

  // 2. Antibiotic overlap
  if (isAntibiotic(input.medicationName, input.category)) {
    const activeAntibiotic = activeMeds.find((m) =>
      isAntibiotic(m.medicationName, m.category)
    );
    if (activeAntibiotic) {
      alerts.push({
        type: "antibiotic_overlap",
        severity: "high",
        title: "Antibiotic Overlap Warning",
        description: `Patient is already on an active antibiotic (${activeAntibiotic.medicationName}). Concurrent antibiotic use requires clinical justification.`,
      });
    }
  }

  // 3. Allergy conflict (keyword-based)
  const patientProfile = await PatientProfileModel.findOne({
    userId: patientUserId,
  }).lean();

  if (patientProfile?.allergies?.length) {
    const medText = `${input.medicationName} ${input.category ?? ""}`.toLowerCase();
    const matched = patientProfile.allergies.find((allergy) =>
      medText.includes(allergy.toLowerCase())
    );
    if (matched) {
      alerts.push({
        type: "allergy_conflict",
        severity: "critical",
        title: "Possible Allergy Conflict",
        description: `Patient's allergy profile includes "${matched}", which may conflict with this medication. Verify before proceeding.`,
      });
    }
  }

  // 4. Long duration warning (> LONG_DURATION_DAYS days)
  if (input.startDate && input.endDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (durationDays > LONG_DURATION_DAYS) {
      alerts.push({
        type: "long_duration",
        severity: "info",
        title: "Extended Duration Medication",
        description: `This medication is scheduled for ${Math.round(durationDays)} days. Long-term use should be monitored regularly.`,
      });
    }
  }

  return alerts;
}

/**
 * Persist generated alerts to the database and return their IDs.
 */
export async function saveAlerts(
  patientId: string,
  previews: AlertPreview[],
  opts: {
    relatedMedicationId?: string;
    relatedPrescriptionId?: string;
  } = {}
): Promise<Types.ObjectId[]> {
  if (previews.length === 0) return [];

  await connectDB();

  const docs = await AlertModel.insertMany(
    previews.map((p) => ({
      patientId,
      type: p.type,
      severity: p.severity,
      title: p.title,
      description: p.description,
      generatedBySystem: true,
      resolved: false,
      relatedMedicationId: opts.relatedMedicationId || undefined,
      relatedPrescriptionId: opts.relatedPrescriptionId || undefined,
    }))
  );

  return docs.map((d) => d._id as Types.ObjectId);
}

/**
 * Check if patient has missed adherence above threshold (for proactive alerts).
 */
export async function checkAdherenceThreshold(
  patientId: string,
  medicationLogId: string,
  adherenceScore: number
): Promise<void> {
  const POOR_THRESHOLD = 50;
  if (adherenceScore > POOR_THRESHOLD) return;

  await connectDB();

  // Avoid duplicate threshold alerts within 7 days
  const recentAlert = await AlertModel.findOne({
    patientId,
    relatedMedicationId: medicationLogId,
    type: "missed_adherence_threshold",
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  if (!recentAlert) {
    await AlertModel.create({
      patientId,
      relatedMedicationId: medicationLogId,
      type: "missed_adherence_threshold",
      severity: "warning",
      title: "Low Adherence Detected",
      description: `Medication adherence has dropped to ${adherenceScore}%. Please review and support the patient.`,
      generatedBySystem: true,
      resolved: false,
    });
  }
}

export async function getUnresolvedAlerts(patientId: string) {
  await connectDB();
  return AlertModel.find({ patientId, resolved: false })
    .sort({ createdAt: -1 })
    .lean();
}

export async function acknowledgeAlert(
  alertId: string,
  actor: ActorContext
): Promise<void> {
  await connectDB();
  await AlertModel.findByIdAndUpdate(alertId, {
    acknowledgedBy: actor.userId,
    acknowledgedAt: new Date(),
  });
}

export async function resolveAlert(alertId: string): Promise<void> {
  await connectDB();
  await AlertModel.findByIdAndUpdate(alertId, {
    resolved: true,
    resolvedAt: new Date(),
  });
}

export async function getAllAlertsAdmin(limit = 50) {
  await connectDB();
  return AlertModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("patientId", "name phone")
    .lean();
}
