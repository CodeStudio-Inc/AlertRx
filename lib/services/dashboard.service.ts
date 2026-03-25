import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { PatientProfileModel } from "@/models/PatientProfile";
import { MedicationLogModel } from "@/models/MedicationLog";
import { PrescriptionModel } from "@/models/Prescription";
import { AlertModel } from "@/models/Alert";
import { AdherenceLogModel } from "@/models/AdherenceLog";
import { FacilityModel } from "@/models/Facility";
import { UploadModel } from "@/models/Upload";
import { DispenseRecordModel } from "@/models/DispenseRecord";
import { getAdherenceScore } from "./adherence.service";
import { getUnresolvedAlerts } from "./alerts.service";
import type { ActorContext, DashboardMetric } from "@/lib/types";
import { subDays } from "date-fns";

/**
 * Accepts the user._id (string) and resolves the linked PatientProfile._id
 * before querying adherence/medication logs which use patientProfile._id.
 */
async function resolvePatientProfileId(userIdOrProfileId: string): Promise<string> {
  const profile = await PatientProfileModel.findOne({ userId: userIdOrProfileId })
    .select("_id")
    .lean();
  if (profile) return (profile as any)._id.toString();
  // Fall back: assume it already is a profile _id
  return userIdOrProfileId;
}

export async function getPatientDashboardData(userOrProfileId: string) {
  await connectDB();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const profileId = await resolvePatientProfileId(userOrProfileId);

  const [activeMedications, todaysDoses, scoreResult, alerts] =
    await Promise.all([
      MedicationLogModel.find({ patientId: profileId, status: "active" })
        .sort({ startDate: -1 })
        .lean(),
      AdherenceLogModel.find({
        patientId: profileId,
        scheduledAt: { $gte: startOfToday, $lte: endOfToday },
      }).lean(),
      getAdherenceScore(profileId, 30),
      getUnresolvedAlerts(profileId),
    ]);

  const takenToday = todaysDoses.filter((d) => d.status === "taken").length;

  // Build 7-day weekly adherence
  const weeklyAdherence = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      return AdherenceLogModel.find({
        patientId: profileId,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
      })
        .lean()
        .then((doses) => {
          const total = doses.length;
          const taken = doses.filter((d) => d.status === "taken").length;
          return {
            date: dayStart.toISOString(),
            score: total === 0 ? 0 : Math.round((taken / total) * 100),
          };
        });
    })
  );

  return {
    activeMedications: activeMedications.length,
    adherenceScore: scoreResult,
    dosesTakenToday: takenToday,
    dosesTotalToday: todaysDoses.length,
    unresolvedAlerts: alerts.length,
    todaysDoses: todaysDoses.map((d: any) => ({
      adherenceLogId: d._id.toString(),
      drugName: "Medication",
      dosage: "",
      scheduledAt: d.scheduledAt,
      status: d.status,
    })),
    weeklyAdherence,
    recentAlerts: alerts,
  };
}

export async function getProviderDashboardData(providerUserId: string) {
  await connectDB();

  const [prescriptions, alerts, totalPrescriptions, lowAdherenceProfiles] =
    await Promise.all([
      PrescriptionModel.find({ providerId: providerUserId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("patientId")
        .lean(),
      AlertModel.find({ resolved: false })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      PrescriptionModel.countDocuments({ providerId: providerUserId }),
      AdherenceLogModel.aggregate([
        { $match: { status: { $in: ["taken", "missed"] } } },
        {
          $group: {
            _id: "$patientId",
            taken: { $sum: { $cond: [{ $eq: ["$status", "taken"] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        {
          $addFields: {
            score: { $multiply: [{ $divide: ["$taken", "$total"] }, 100] },
          },
        },
        { $match: { score: { $lt: 70 } } },
      ]),
    ]);

  // Build recent patients list from prescriptions
  const seenPatientIds = new Set<string>();
  const recentPatients: any[] = [];
  for (const rx of prescriptions) {
    const p: any = rx.patientId;
    if (!p || seenPatientIds.has(p._id?.toString())) continue;
    seenPatientIds.add(p._id?.toString());
    const profile = await PatientProfileModel.findOne({ _id: p._id }).lean();
    const user = await UserModel.findById((profile as any)?.userId).lean();
    recentPatients.push({
      id: p._id.toString(),
      name: (user as any)?.name ?? "Unknown",
      patientId: (profile as any)?.patientId ?? "",
      phone: (user as any)?.phone ?? "",
      adherenceScore: 0,
      activeMedications: 0,
      unresolvedAlerts: 0,
    });
    if (recentPatients.length >= 5) break;
  }

  return {
    totalPatients: seenPatientIds.size,
    totalPrescriptions,
    pendingAlerts: alerts.filter((a: any) => !a.resolved).length,
    lowAdherenceCount: lowAdherenceProfiles.length,
    recentPatients,
    recentAlerts: alerts.slice(0, 5),
  };
}

export async function getPharmacistDashboardData(pharmacistUserId: string) {
  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [allRecords, flaggedForReview, dispensesToday] = await Promise.all([
    DispenseRecordModel.find({ pharmacistId: pharmacistUserId })
      .sort({ dispensedAt: -1 })
      .lean(),
    DispenseRecordModel.countDocuments({
      pharmacistId: pharmacistUserId,
      flaggedForReview: true,
    }),
    DispenseRecordModel.countDocuments({
      pharmacistId: pharmacistUserId,
      dispensedAt: { $gte: startOfToday },
    }),
  ]);

  const uniquePatientIds = new Set(
    allRecords.map((r: any) => r.patientId?.toString())
  );

  const recentDispenses = allRecords.slice(0, 5).map((r: any) => ({
    _id: r._id.toString(),
    patientName: "Patient",
    medicationName: r.medicationName ?? "",
    flaggedForReview: r.flaggedForReview,
    dispensedAt: r.dispensedAt,
  }));

  return {
    dispensesToday,
    totalDispenses: allRecords.length,
    patientsServed: uniquePatientIds.size,
    flaggedForReview,
    recentDispenses,
    flaggedPatients: [],
  };
}

export async function getAdminDashboardData() {
  await connectDB();

  const [
    totalUsers,
    activePatients,
    totalFacilities,
    unresolvedAlerts,
    recentUsers,
    criticalAlerts,
    usersByRoleRaw,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ role: "patient", onboardingCompleted: true }),
    FacilityModel.countDocuments(),
    AlertModel.countDocuments({ resolved: false }),
    UserModel.find().sort({ createdAt: -1 }).limit(10).lean(),
    AlertModel.find({
      resolved: false,
      severity: { $in: ["high", "critical"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
  ]);

  const usersByRole = usersByRoleRaw.map((r: any) => ({
    role: r._id,
    count: r.count,
  }));

  return {
    totalUsers,
    activePatients,
    totalFacilities,
    unresolvedAlerts,
    recentUsers: recentUsers.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      onboardingCompleted: u.onboardingCompleted,
      createdAt: u.createdAt,
    })),
    criticalAlerts: criticalAlerts.map((a: any) => ({
      _id: a._id.toString(),
      message: a.message,
      severity: a.severity,
      type: a.type,
      createdAt: a.createdAt,
      patientId: a.patientId?.toString(),
    })),
    usersByRole,
  };
}
