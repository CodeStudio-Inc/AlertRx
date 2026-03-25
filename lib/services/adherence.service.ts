/**
 * adherence.service.ts
 *
 * Handles scheduled dose generation and tracking.
 * Doses are generated on-demand when patient views the adherence page.
 */

import {
  startOfDay,
  endOfDay,
  addDays,
  eachDayOfInterval,
  setHours,
} from "date-fns";
import { connectDB } from "@/lib/db/connect";
import { AdherenceLogModel } from "@/models/AdherenceLog";
import { MedicationLogModel } from "@/models/MedicationLog";
import { checkAdherenceThreshold } from "./alerts.service";
import { calculateAdherenceScore } from "@/lib/utils/format";
import type { ActorContext, ServiceResult } from "@/lib/types";
import type { MarkDoseInput } from "@/lib/validators/adherence.schema";
import type { MedicationFrequency } from "@/lib/types";

// Scheduled dose times per frequency
const DOSE_HOURS: Record<MedicationFrequency, number[]> = {
  once_daily: [8],
  twice_daily: [8, 20],
  three_times_daily: [8, 14, 20],
  four_times_daily: [8, 12, 16, 20],
  every_8_hours: [8, 16, 24],
  every_12_hours: [8, 20],
  weekly: [8],
  as_needed: [], // no scheduled doses
};

/**
 * Generate pending AdherenceLog entries for active medications
 * for the past N days. Idempotent — skips already-created entries.
 */
export async function ensureAdherenceLogsForPatient(
  patientUserId: string,
  daysBack = 7
): Promise<void> {
  await connectDB();

  const activeMeds = await MedicationLogModel.find({
    patientId: patientUserId,
    status: "active",
    frequency: { $ne: "as_needed" },
  }).lean();

  const now = new Date();
  const rangeStart = startOfDay(addDays(now, -daysBack));
  const rangeEnd = endOfDay(now);

  for (const med of activeMeds) {
    const medStart = new Date(
      Math.max(med.startDate.getTime(), rangeStart.getTime())
    );
    const medEnd = med.endDate
      ? new Date(Math.min(med.endDate.getTime(), rangeEnd.getTime()))
      : rangeEnd;

    if (medStart > medEnd) continue;

    const days = eachDayOfInterval({ start: medStart, end: medEnd });
    const hours = DOSE_HOURS[med.frequency as MedicationFrequency] ?? [8];

    const scheduledSlots: Date[] = [];
    for (const day of days) {
      for (const hour of hours) {
        scheduledSlots.push(setHours(day, hour));
      }
    }

    // Batch-check existing logs to avoid duplicates
    const existingLogs = await AdherenceLogModel.find({
      medicationLogId: med._id,
      scheduledAt: { $gte: medStart, $lte: medEnd },
    })
      .select("scheduledAt")
      .lean();

    const existingTimes = new Set(
      existingLogs.map((l) => l.scheduledAt.getTime())
    );

    const toInsert = scheduledSlots
      .filter((slot) => !existingTimes.has(slot.getTime()))
      .map((slot) => ({
        patientId: patientUserId,
        medicationLogId: med._id,
        scheduledAt: slot,
        status: slot < now ? "missed" : "pending",
      }));

    if (toInsert.length > 0) {
      await AdherenceLogModel.insertMany(toInsert, { ordered: false }).catch(
        () => {} // Ignore duplicate key errors
      );
    }
  }
}

export async function getTodaysDoses(patientUserId: string) {
  await connectDB();
  await ensureAdherenceLogsForPatient(patientUserId, 1);

  const now = new Date();
  return AdherenceLogModel.find({
    patientId: patientUserId,
    scheduledAt: { $gte: startOfDay(now), $lte: endOfDay(now) },
  })
    .populate("medicationLogId", "medicationName dosage frequency route")
    .sort({ scheduledAt: 1 })
    .lean();
}

export async function getAdherenceHistory(
  patientUserId: string,
  daysBack = 30
) {
  await connectDB();
  await ensureAdherenceLogsForPatient(patientUserId, daysBack);

  const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  return AdherenceLogModel.find({
    patientId: patientUserId,
    scheduledAt: { $gte: cutoff },
  })
    .populate("medicationLogId", "medicationName dosage")
    .sort({ scheduledAt: -1 })
    .lean();
}

export async function markDose(
  input: MarkDoseInput,
  actor: ActorContext
): Promise<ServiceResult> {
  await connectDB();

  const log = await AdherenceLogModel.findById(input.adherenceLogId);
  if (!log) return { success: false, error: "Dose record not found" };

  if (log.patientId.toString() !== actor.userId && actor.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  log.status = input.status;
  log.notes = input.notes || undefined;
  if (input.status === "taken") {
    log.takenAt = new Date();
  }
  await log.save();

  // Recalculate adherence and check threshold
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const allLogs = await AdherenceLogModel.find({
    patientId: actor.userId,
    medicationLogId: log.medicationLogId,
    scheduledAt: { $gte: thirtyDaysAgo, $lt: new Date() },
  }).lean();

  const takenCount = allLogs.filter((l) => l.status === "taken").length;
  const score = calculateAdherenceScore(takenCount, allLogs.length);

  await checkAdherenceThreshold(
    actor.userId,
    log.medicationLogId.toString(),
    score
  );

  return { success: true };
}

export async function getAdherenceScore(
  patientUserId: string,
  daysBack = 30
): Promise<number> {
  await connectDB();
  const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const logs = await AdherenceLogModel.find({
    patientId: patientUserId,
    scheduledAt: { $gte: cutoff, $lt: new Date() },
    status: { $in: ["taken", "missed"] },
  }).lean();

  const taken = logs.filter((l) => l.status === "taken").length;
  return calculateAdherenceScore(taken, logs.length);
}

export async function getDispenseRecordsForPharmacist(pharmacistId: string): Promise<ServiceResult<any[]>> {
  await connectDB();
  try {
    const { DispenseRecordModel } = await import("@/models/DispenseRecord");
    const records = await DispenseRecordModel.find({ pharmacistId })
      .sort({ dispensedAt: -1 })
      .lean();
    return { success: true, data: records };
  } catch {
    return { success: false, error: "Failed to fetch dispense records" };
  }
}
