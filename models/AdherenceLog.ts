import mongoose, { Schema, Types, type Document, type Model } from "mongoose";
import type { AdherenceStatus } from "@/lib/types";

export interface IAdherenceLog extends Document {
  patientId: Types.ObjectId;
  medicationLogId: Types.ObjectId;
  scheduledAt: Date;
  takenAt?: Date;
  status: AdherenceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdherenceLogSchema = new Schema<IAdherenceLog>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicationLogId: {
      type: Schema.Types.ObjectId,
      ref: "MedicationLog",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    takenAt: { type: Date },
    status: {
      type: String,
      enum: ["taken", "missed", "pending", "skipped"],
      default: "pending",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

AdherenceLogSchema.index({ patientId: 1, scheduledAt: -1 });
AdherenceLogSchema.index({ patientId: 1, status: 1 });
AdherenceLogSchema.index({ medicationLogId: 1, scheduledAt: -1 });

export const AdherenceLogModel: Model<IAdherenceLog> =
  (mongoose.models.AdherenceLog as Model<IAdherenceLog>) ||
  mongoose.model<IAdherenceLog>("AdherenceLog", AdherenceLogSchema);
