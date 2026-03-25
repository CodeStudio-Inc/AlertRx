import mongoose, { Schema, Types, type Document, type Model } from "mongoose";

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IPatientProfile extends Document {
  userId: Types.ObjectId;
  patientId: string; // e.g. ALX-2024-00042
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  address?: string;
  allergies: string[];
  chronicConditions: string[];
  pregnancyStatus?: "not_pregnant" | "pregnant" | "postpartum" | "not_applicable";
  emergencyContact?: IEmergencyContact;
  preferredReminderMethod?: "none" | "in_app";
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    patientId: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    address: { type: String, trim: true },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    pregnancyStatus: {
      type: String,
      enum: ["not_pregnant", "pregnant", "postpartum", "not_applicable"],
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    preferredReminderMethod: {
      type: String,
      enum: ["none", "in_app"],
      default: "in_app",
    },
  },
  { timestamps: true }
);

PatientProfileSchema.index({ userId: 1 });
PatientProfileSchema.index({ patientId: 1 });

export const PatientProfileModel: Model<IPatientProfile> =
  (mongoose.models.PatientProfile as Model<IPatientProfile>) ||
  mongoose.model<IPatientProfile>("PatientProfile", PatientProfileSchema);
