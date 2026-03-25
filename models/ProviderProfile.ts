import mongoose, { Schema, Types, type Document, type Model } from "mongoose";

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  profession: string;
  licenseNumber?: string;
  specialization?: string;
  facilityId?: Types.ObjectId;
  facilityName?: string;
  facilityType?: string;
  facilityLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profession: { type: String, required: true, trim: true },
    licenseNumber: { type: String, trim: true },
    specialization: { type: String, trim: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
    facilityName: { type: String, trim: true },
    facilityType: { type: String, trim: true },
    facilityLocation: { type: String, trim: true },
  },
  { timestamps: true }
);

ProviderProfileSchema.index({ userId: 1 });
ProviderProfileSchema.index({ facilityId: 1 });

export const ProviderProfileModel: Model<IProviderProfile> =
  (mongoose.models.ProviderProfile as Model<IProviderProfile>) ||
  mongoose.model<IProviderProfile>("ProviderProfile", ProviderProfileSchema);
