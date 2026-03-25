import mongoose, { Schema, Types, type Document, type Model } from "mongoose";
import type {
  MedicationStatus,
  MedicationFrequency,
  RouteOfAdministration,
} from "@/lib/types";

export interface IMedicationLog extends Document {
  patientId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  medicationName: string;
  category?: string;
  dosage: string;
  frequency: MedicationFrequency;
  route: RouteOfAdministration;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  sourceFacilityId?: Types.ObjectId;
  sourceText?: string; // free-text source if no facility
  reason?: string;
  notes?: string;
  attachmentIds: Types.ObjectId[];
  status: MedicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationLogSchema = new Schema<IMedicationLog>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicationName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: {
      type: String,
      enum: [
        "once_daily",
        "twice_daily",
        "three_times_daily",
        "four_times_daily",
        "every_8_hours",
        "every_12_hours",
        "weekly",
        "as_needed",
      ],
      required: true,
    },
    route: {
      type: String,
      enum: [
        "oral",
        "topical",
        "injection",
        "inhaled",
        "sublingual",
        "rectal",
        "ophthalmic",
        "otic",
        "nasal",
        "other",
      ],
      default: "oral",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    prescribedBy: { type: String, trim: true },
    sourceFacilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
    sourceText: { type: String, trim: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    attachmentIds: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
    status: {
      type: String,
      enum: ["active", "completed", "discontinued", "on_hold"],
      default: "active",
    },
  },
  { timestamps: true }
);

MedicationLogSchema.index({ patientId: 1, status: 1 });
MedicationLogSchema.index({ patientId: 1, createdAt: -1 });
MedicationLogSchema.index({ medicationName: "text" });

export const MedicationLogModel: Model<IMedicationLog> =
  (mongoose.models.MedicationLog as Model<IMedicationLog>) ||
  mongoose.model<IMedicationLog>("MedicationLog", MedicationLogSchema);
