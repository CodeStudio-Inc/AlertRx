import mongoose, { Schema, Types, type Document, type Model } from "mongoose";
import type { PrescriptionStatus } from "@/lib/types";

export interface IPrescriptionMedItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  duration?: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  patientId: Types.ObjectId;
  providerId: Types.ObjectId;
  facilityId?: Types.ObjectId;
  medications: IPrescriptionMedItem[];
  notes?: string;
  issueDate: Date;
  status: PrescriptionStatus;
  alertIds: Types.ObjectId[];
  attachmentIds: Types.ObjectId[];
  acknowledgedAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionMedItemSchema = new Schema<IPrescriptionMedItem>(
  {
    medicationName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true },
    route: { type: String, required: true },
    duration: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
    medications: { type: [PrescriptionMedItemSchema], required: true },
    notes: { type: String, trim: true },
    issueDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["active", "fulfilled", "cancelled", "expired"],
      default: "active",
    },
    alertIds: [{ type: Schema.Types.ObjectId, ref: "Alert" }],
    attachmentIds: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
    acknowledgedAlerts: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ providerId: 1, createdAt: -1 });
PrescriptionSchema.index({ status: 1 });

export const PrescriptionModel: Model<IPrescription> =
  (mongoose.models.Prescription as Model<IPrescription>) ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
