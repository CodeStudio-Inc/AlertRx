import mongoose, { Schema, Types, type Document, type Model } from "mongoose";

export interface IDispenseRecord extends Document {
  patientId: Types.ObjectId;
  pharmacistId: Types.ObjectId;
  facilityId?: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  medicationName: string;
  quantity: string;
  dispensedAt: Date;
  notes?: string;
  flaggedForReview: boolean;
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DispenseRecordSchema = new Schema<IDispenseRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pharmacistId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription" },
    medicationName: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    dispensedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
    flaggedForReview: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },
  },
  { timestamps: true }
);

DispenseRecordSchema.index({ patientId: 1, dispensedAt: -1 });
DispenseRecordSchema.index({ pharmacistId: 1, dispensedAt: -1 });

export const DispenseRecordModel: Model<IDispenseRecord> =
  (mongoose.models.DispenseRecord as Model<IDispenseRecord>) ||
  mongoose.model<IDispenseRecord>("DispenseRecord", DispenseRecordSchema);
