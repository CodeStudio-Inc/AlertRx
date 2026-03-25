import { z } from "zod";

export const uploadMetadataSchema = z.object({
  resourceType: z.enum(["prescription", "drug_note", "medical_photo", "other"]),
  patientId: z.string().optional().or(z.literal("")),
  originalName: z.string().min(1).max(255),
  mimeType: z
    .string()
    .refine(
      (val) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(val),
      "Only JPEG, PNG, WebP, and PDF files are allowed"
    ),
  size: z
    .number()
    .max(10 * 1024 * 1024, "File size must not exceed 10 MB"),
});

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;
