import { z } from "zod";

export const medicationLogSchema = z.object({
  medicationName: z.string().min(2, "Medication name is required").max(200),
  category: z.string().max(100).optional().or(z.literal("")),
  dosage: z.string().min(1, "Dosage is required").max(100),
  frequency: z.enum([
    "once_daily",
    "twice_daily",
    "three_times_daily",
    "four_times_daily",
    "every_8_hours",
    "every_12_hours",
    "weekly",
    "as_needed",
  ]),
  route: z.enum([
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
  ]),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date is required",
  }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid end date"),
  prescribedBy: z.string().max(200).optional().or(z.literal("")),
  sourceText: z.string().max(200).optional().or(z.literal("")),
  reason: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type MedicationLogInput = z.infer<typeof medicationLogSchema>;
