import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { ProviderProfileModel } from "@/models/ProviderProfile";
import { FacilityModel } from "@/models/Facility";
import type { ActorContext, ServiceResult } from "@/lib/types";
import type {
  ProviderOnboardingInput,
  PharmacistOnboardingInput,
} from "@/lib/validators/provider.schema";

export async function completeProviderOnboarding(
  input: ProviderOnboardingInput | PharmacistOnboardingInput,
  actor: ActorContext
): Promise<ServiceResult> {
  await connectDB();

  const existing = await ProviderProfileModel.findOne({ userId: actor.userId });
  if (existing) {
    return { success: false, error: "Profile already exists" };
  }

  // Create or find facility
  let facility = await FacilityModel.findOne({
    name: (input as ProviderOnboardingInput).facilityName,
    location: (input as ProviderOnboardingInput).facilityLocation,
  });

  if (!facility) {
    facility = await FacilityModel.create({
      name: (input as ProviderOnboardingInput).facilityName,
      type: (input as ProviderOnboardingInput).facilityType,
      location: (input as ProviderOnboardingInput).facilityLocation,
      createdBy: actor.userId,
    });
  }

  await ProviderProfileModel.create({
    userId: actor.userId,
    profession: input.profession,
    licenseNumber: input.licenseNumber,
    specialization: (input as ProviderOnboardingInput).specialization,
    facilityId: facility._id,
    facilityName: (input as ProviderOnboardingInput).facilityName,
    facilityType: (input as ProviderOnboardingInput).facilityType,
    facilityLocation: (input as ProviderOnboardingInput).facilityLocation,
  });

  await UserModel.findByIdAndUpdate(actor.userId, {
    onboardingCompleted: true,
  });

  return { success: true };
}

export async function getProviderProfile(userId: string) {
  await connectDB();
  const [user, profile] = await Promise.all([
    UserModel.findById(userId).select("-password").lean(),
    ProviderProfileModel.findOne({ userId })
      .populate("facilityId")
      .lean(),
  ]);
  return { user, profile };
}

export async function getAllFacilities(): Promise<ServiceResult<any[]>> {
  await connectDB();
  try {
    const facilities = await FacilityModel.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: facilities };
  } catch {
    return { success: false, error: "Failed to fetch facilities" };
  }
}
