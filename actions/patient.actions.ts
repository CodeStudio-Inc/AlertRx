"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  completePatientOnboarding,
  updatePatientProfile,
  getPatientProfile,
} from "@/lib/services/patients.service";
import {
  completeProviderOnboarding,
} from "@/lib/services/providers.service";
import { patientOnboardingSchema } from "@/lib/validators/patient.schema";
import {
  providerOnboardingSchema,
  pharmacistOnboardingSchema,
} from "@/lib/validators/provider.schema";
import type { ActorContext } from "@/lib/types";

export async function completeOnboardingAction(formData: Record<string, any>) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
    name: session.user.name ?? undefined,
  };

  if (actor.role === "patient") {
    const parsed = patientOnboardingSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }
    const result = await completePatientOnboarding(parsed.data, actor);
    if (!result.success) return { error: result.error };
    revalidatePath("/dashboard");
    return { success: true, patientId: result.data?.patientId };
  }

  if (actor.role === "provider") {
    const parsed = providerOnboardingSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }
    const result = await completeProviderOnboarding(parsed.data, actor);
    if (!result.success) return { error: result.error };
    revalidatePath("/dashboard");
    return { success: true };
  }

  if (actor.role === "pharmacist") {
    const parsed = pharmacistOnboardingSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }
    const result = await completeProviderOnboarding(parsed.data, actor);
    if (!result.success) return { error: result.error };
    revalidatePath("/dashboard");
    return { success: true };
  }

  return { error: "Invalid role for onboarding" };
}

export async function updatePatientProfileAction(formData: Record<string, any>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") {
    return { error: "Unauthorized" };
  }

  const parsed = patientOnboardingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const actor: ActorContext = {
    userId: session.user.id,
    role: "patient",
    name: session.user.name ?? undefined,
  };

  const result = await updatePatientProfile(parsed.data, actor);
  if (!result.success) return { error: result.error };

  revalidatePath("/patient/profile");
  return { success: true };
}

export async function getPatientProfileAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") return null;
  return getPatientProfile(session.user.id);
}
