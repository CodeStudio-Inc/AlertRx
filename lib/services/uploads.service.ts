import { connectDB } from "@/lib/db/connect";
import { UploadModel } from "@/models/Upload";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/cloudinary/client";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validators/upload.schema";
import type { ActorContext, ServiceResult } from "@/lib/types";
import type { UploadResourceType } from "@/models/Upload";

export interface UploadFileInput {
  file: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  resourceType: UploadResourceType;
  patientId?: string;
}

export interface UploadFileResult {
  uploadId: string;
  secureUrl: string;
  publicId: string;
}

export async function uploadFile(
  input: UploadFileInput,
  actor: ActorContext
): Promise<ServiceResult<UploadFileResult>> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.",
    };
  }

  // Validate file size
  if (input.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File size exceeds 10 MB limit.",
    };
  }

  const cloudinaryResourceType =
    input.mimeType === "application/pdf" ? "raw" : "image";

  // Upload to Cloudinary
  const result = await uploadToCloudinary(
    input.file,
    `alertrx/${input.resourceType}`,
    cloudinaryResourceType
  );

  // Persist metadata in MongoDB
  const upload = await UploadModel.create({
    ownerUserId: actor.userId,
    patientId: input.patientId || undefined,
    resourceType: input.resourceType,
    originalName: input.originalName,
    mimeType: input.mimeType,
    size: input.size,
    cloudinaryPublicId: result.public_id,
    secureUrl: result.secure_url,
    uploadedAt: new Date(),
  });

  return {
    success: true,
    data: {
      uploadId: upload._id.toString(),
      secureUrl: result.secure_url,
      publicId: result.public_id,
    },
  };
}

export async function getUploadsForOwner(userId: string): Promise<ServiceResult<any[]>> {
  await connectDB();
  try {
    const uploads = await UploadModel.find({ ownerUserId: userId })
      .sort({ uploadedAt: -1 })
      .lean();
    return { success: true, data: uploads };
  } catch {
    return { success: false, error: "Failed to fetch uploads" };
  }
}

export async function getUploadsForUser(userId: string, limit = 20) {
  await connectDB();
  return UploadModel.find({ ownerUserId: userId })
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUploadById(uploadId: string) {
  await connectDB();
  return UploadModel.findById(uploadId).lean();
}

export async function deleteUpload(
  uploadId: string,
  actor: ActorContext
): Promise<ServiceResult> {
  await connectDB();
  const upload = await UploadModel.findById(uploadId);
  if (!upload) return { success: false, error: "Upload not found" };

  if (
    upload.ownerUserId.toString() !== actor.userId &&
    actor.role !== "admin"
  ) {
    return { success: false, error: "Unauthorized" };
  }

  await deleteFromCloudinary(upload.cloudinaryPublicId);
  await upload.deleteOne();
  return { success: true };
}
