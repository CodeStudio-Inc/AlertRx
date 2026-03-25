import mongoose, { Schema, Types, type Document, type Model } from "mongoose";
import type { AlertType, AlertSeverity } from "@/lib/types";

export interface IAlert extends Document {
  patientId: Types.ObjectId;
  relatedMedicationId?: Types.ObjectId;
  relatedPrescriptionId?: Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  generatedBySystem: boolean;
  acknowledgedBy?: Types.ObjectId;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedMedicationId: { type: Schema.Types.ObjectId, ref: "MedicationLog" },
    relatedPrescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription" },
    type: {
      type: String,
      enum: [
        "duplicate_medication",
        "antibiotic_overlap",
        "allergy_conflict",
        "long_duration",
        "missed_adherence_threshold",
        "same_drug_active",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "high", "critical"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    generatedBySystem: { type: Boolean, default: true },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: { type: Date },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ patientId: 1, resolved: 1 });
AlertSchema.index({ patientId: 1, createdAt: -1 });
AlertSchema.index({ severity: 1, resolved: 1 });

export const AlertModel: Model<IAlert> =
  (mongoose.models.Alert as Model<IAlert>) ||
  mongoose.model<IAlert>("Alert", AlertSchema);
