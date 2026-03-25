"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { FacilityModel } from "@/models/Facility";
import { AlertModel } from "@/models/Alert";
import { acknowledgeAlert, resolveAlert } from "@/lib/services/alerts.service";
import {
  createFacilitySchema,
  updateUserStatusSchema,
} from "@/lib/validators/admin.schema";
import type { ActorContext } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAllUsersAction(role?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  await connectDB();
  const query = role ? { role } : {};
  return UserModel.find(query).select("-password").sort({ createdAt: -1 }).lean();
}

export async function updateUserStatusAction(data: {
  userId: string;
  status: "active" | "inactive" | "suspended";
}) {
  await requireAdmin();

  const parsed = updateUserStatusSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  await UserModel.findByIdAndUpdate(parsed.data.userId, {
    status: parsed.data.status,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function createFacilityAction(formData: Record<string, any>) {
  const session = await requireAdmin();

  const parsed = createFacilitySchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  await FacilityModel.create({
    ...parsed.data,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/facilities");
  return { success: true };
}

export async function getFacilitiesAction() {
  const session = await auth();
  if (!session?.user) return [];
  await connectDB();
  return FacilityModel.find().sort({ createdAt: -1 }).lean();
}

export async function acknowledgeAlertAction(alertId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
  };

  await connectDB();
  await acknowledgeAlert(alertId, actor);
  revalidatePath("/admin/alerts");
  revalidatePath("/provider/alerts");
  return { success: true };
}

export async function resolveAlertAction(alertId: string) {
  const session = await auth();
  if (!session?.user || !["admin", "provider"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  await connectDB();
  await resolveAlert(alertId);
  revalidatePath("/admin/alerts");
  revalidatePath("/provider/alerts");
  return { success: true };
}
