"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connect";
import { UploadModel } from "@/models/Upload";
import { MedicationLogModel } from "@/models/MedicationLog";
import type { ActorContext } from "@/lib/types";
import { deleteUpload } from "@/lib/services/uploads.service";

export async function getMyUploadsAction() {
  const session = await auth();
  if (!session?.user) return [];
  await connectDB();
  return UploadModel.find({ ownerUserId: session.user.id })
    .sort({ uploadedAt: -1 })
    .lean();
}

export async function deleteUploadAction(uploadId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
  };

  const result = await deleteUpload(uploadId, actor);
  revalidatePath("/patient/uploads");
  return result;
}

export async function attachUploadToMedication(
  uploadId: string,
  medicationId: string
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  await connectDB();
  await MedicationLogModel.findByIdAndUpdate(medicationId, {
    $addToSet: { attachmentIds: uploadId },
  });

  revalidatePath("/medications");
  return { success: true };
}
