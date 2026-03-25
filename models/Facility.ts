import mongoose, { Schema, Types, type Document, type Model } from "mongoose";
import type { FacilityType } from "@/lib/types";

export interface IFacility extends Document {
  name: string;
  type: FacilityType;
  location: string;
  contactPhone?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["hospital", "clinic", "pharmacy", "health_center", "lab", "other"],
      required: true,
    },
    location: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FacilitySchema.index({ name: 1 });
FacilitySchema.index({ type: 1 });

export const FacilityModel: Model<IFacility> =
  (mongoose.models.Facility as Model<IFacility>) ||
  mongoose.model<IFacility>("Facility", FacilitySchema);
