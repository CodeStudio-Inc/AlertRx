import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { PatientProfileModel } from "@/models/PatientProfile";
import { MedicationLogModel } from "@/models/MedicationLog";
import { AlertModel } from "@/models/Alert";
import { AdherenceLogModel } from "@/models/AdherenceLog";
import { generatePatientId, calculateAdherenceScore } from "@/lib/utils/format";
import type { ActorContext, PatientSummary, ServiceResult } from "@/lib/types";
import type { PatientOnboardingInput } from "@/lib/validators/patient.schema";

export async function completePatientOnboarding(
  input: PatientOnboardingInput,
  actor: ActorContext
): Promise<ServiceResult<{ patientId: string }>> {
  await connectDB();

  const existing = await PatientProfileModel.findOne({ userId: actor.userId });
  if (existing) {
    return { success: false, error: "Profile already exists" };
  }

  const patientId = generatePatientId();

  await PatientProfileModel.create({
    userId: actor.userId,
    patientId,
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
    gender: input.gender,
    address: input.address,
    allergies: input.allergies,
    chronicConditions: input.chronicConditions,
    pregnancyStatus: input.pregnancyStatus,
    emergencyContact:
      input.emergencyContactName
        ? {
            name: input.emergencyContactName,
            relationship: input.emergencyContactRelationship,
            phone: input.emergencyContactPhone,
          }
        : undefined,
  });

  await UserModel.findByIdAndUpdate(actor.userId, {
    onboardingCompleted: true,
  });

  return { success: true, data: { patientId } };
}

export async function updatePatientProfile(
  input: PatientOnboardingInput,
  actor: ActorContext
): Promise<ServiceResult> {
  await connectDB();

  await PatientProfileModel.findOneAndUpdate(
    { userId: actor.userId },
    {
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      address: input.address,
      allergies: input.allergies,
      chronicConditions: input.chronicConditions,
      pregnancyStatus: input.pregnancyStatus,
      emergencyContact: input.emergencyContactName
        ? {
            name: input.emergencyContactName,
            relationship: input.emergencyContactRelationship,
            phone: input.emergencyContactPhone,
          }
        : undefined,
    },
    { upsert: true, new: true }
  );

  return { success: true };
}

export async function getPatientProfile(userId: string) {
  await connectDB();
  const [user, profile] = await Promise.all([
    UserModel.findById(userId).select("-password").lean(),
    PatientProfileModel.findOne({ userId }).lean(),
  ]);
  return { user, profile };
}

/**
 * Search patients by phone or patientId.
 * Used by providers and pharmacists.
 */
export async function searchPatients(
  query: string,
  actor: ActorContext
): Promise<PatientSummary[]> {
  if (!["provider", "pharmacist", "admin"].includes(actor.role)) return [];

  await connectDB();

  const users = await UserModel.find({
    role: "patient",
    status: "active",
    $or: [
      { phone: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
    ],
  })
    .select("-password")
    .limit(10)
    .lean();

  if (users.length === 0) {
    // Try searching by patientId in profiles
    const profiles = await PatientProfileModel.find({
      patientId: { $regex: query, $options: "i" },
    })
      .populate("userId", "-password")
      .limit(10)
      .lean();

    return Promise.all(
      profiles.map(async (p: any) => buildPatientSummary(p.userId, p))
    );
  }

  return Promise.all(
    users.map(async (u) => {
      const profile = await PatientProfileModel.findOne({
        userId: u._id,
      }).lean();
      return buildPatientSummary(u, profile);
    })
  );
}

async function buildPatientSummary(user: any, profile: any): Promise<PatientSummary> {
  const userId = user._id.toString();

  const [activeMedCount, prescriptionCount, alertCount, adherenceLogs] =
    await Promise.all([
      MedicationLogModel.countDocuments({ patientId: userId, status: "active" }),
      // We count prescriptions via a lightweight query
      MedicationLogModel.countDocuments({ patientId: userId }),
      AlertModel.countDocuments({ patientId: userId, resolved: false }),
      AdherenceLogModel.find({
        patientId: userId,
        scheduledAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      })
        .select("status")
        .lean(),
    ]);

  const taken = adherenceLogs.filter((l) => l.status === "taken").length;
  const adherenceScore = calculateAdherenceScore(taken, adherenceLogs.length);

  const age =
    profile?.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(profile.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : undefined;

  return {
    id: userId,
    patientId: profile?.patientId ?? "–",
    name: user.name,
    phone: user.phone,
    email: user.email,
    age,
    gender: profile?.gender,
    activeMedications: activeMedCount,
    recentPrescriptions: prescriptionCount,
    unresolvedAlerts: alertCount,
    adherenceScore: adherenceLogs.length > 0 ? adherenceScore : undefined,
  };
}

/**
 * Get a patient summary by user._id OR patientProfile._id.
 * Actor check is relaxed — callers are responsible for access control.
 */
export async function getPatientSummary(
  patientId: string
): Promise<PatientSummary | null> {
  await connectDB();

  // Try looking up as userId first
  let user = await UserModel.findById(patientId).select("-password").lean();

  // If not found by userId, try patientProfile._id
  if (!user) {
    const profile = await PatientProfileModel.findById(patientId).lean();
    if (!profile) return null;
    user = await UserModel.findById((profile as any).userId)
      .select("-password")
      .lean();
    if (!user) return null;
    return buildPatientSummary(user, profile);
  }

  if (user.role !== "patient") return null;
  const profile = await PatientProfileModel.findOne({ userId: patientId }).lean();
  return buildPatientSummary(user, profile);
}

export async function getAllUsers(
  filters?: { role?: string; status?: string }
): Promise<ServiceResult<any[]>> {
  await connectDB();
  try {
    const query: Record<string, unknown> = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.status) query.status = filters.status;

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: users };
  } catch {
    return { success: false, error: "Failed to fetch users" };
  }
}
