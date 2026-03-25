import { z } from "zod";

export const patientOnboardingSchema = z.object({
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid date of birth"
    ),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
  address: z.string().max(200).optional().or(z.literal("")),
  allergies: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  chronicConditions: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  pregnancyStatus: z
    .enum(["not_pregnant", "pregnant", "postpartum", "not_applicable"])
    .optional(),
  emergencyContactName: z.string().max(100).optional().or(z.literal("")),
  emergencyContactRelationship: z
    .string()
    .max(50)
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z.string().max(20).optional().or(z.literal("")),
});

export const updatePatientProfileSchema = patientOnboardingSchema;

export type PatientOnboardingInput = z.infer<typeof patientOnboardingSchema>;
