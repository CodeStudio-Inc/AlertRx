import mongoose, { Schema, Types, type Document, type Model } from "mongoose";

export type UploadResourceType = "prescription" | "drug_note" | "medical_photo" | "other";

export interface IUpload extends Document {
  ownerUserId: Types.ObjectId;
  patientId?: Types.ObjectId;
  resourceType: UploadResourceType;
  originalName: string;
  mimeType: string;
  size: number;
  cloudinaryPublicId: string;
  secureUrl: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User" },
    resourceType: {
      type: String,
      enum: ["prescription", "drug_note", "medical_photo", "other"],
      required: true,
    },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    cloudinaryPublicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UploadSchema.index({ ownerUserId: 1, createdAt: -1 });
UploadSchema.index({ patientId: 1 });

export const UploadModel: Model<IUpload> =
  (mongoose.models.Upload as Model<IUpload>) ||
  mongoose.model<IUpload>("Upload", UploadSchema);
