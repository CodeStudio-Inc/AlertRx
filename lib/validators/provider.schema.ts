import { z } from "zod";

export const providerOnboardingSchema = z.object({
  profession: z.string().min(2, "Profession is required").max(100),
  licenseNumber: z.string().max(50).optional().or(z.literal("")),
  specialization: z.string().max(100).optional().or(z.literal("")),
  facilityName: z.string().min(2, "Facility name is required").max(200),
  facilityType: z.enum([
    "hospital",
    "clinic",
    "pharmacy",
    "health_center",
    "lab",
    "other",
  ]),
  facilityLocation: z.string().min(2, "Facility location is required").max(200),
});

export const pharmacistOnboardingSchema = z.object({
  profession: z.string().min(2, "Profession is required").max(100),
  licenseNumber: z.string().max(50).optional().or(z.literal("")),
  facilityName: z.string().min(2, "Pharmacy/facility name is required").max(200),
  facilityType: z.enum([
    "hospital",
    "clinic",
    "pharmacy",
    "health_center",
    "lab",
    "other",
  ]),
  facilityLocation: z.string().min(2, "Location is required").max(200),
});

export type ProviderOnboardingInput = z.infer<typeof providerOnboardingSchema>;
export type PharmacistOnboardingInput = z.infer<typeof pharmacistOnboardingSchema>;
