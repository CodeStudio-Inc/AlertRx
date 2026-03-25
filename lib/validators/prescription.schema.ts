import { z } from "zod";

const prescriptionMedItemSchema = z.object({
  medicationName: z.string().min(2, "Medication name required").max(200),
  dosage: z.string().min(1, "Dosage required").max(100),
  frequency: z.string().min(1, "Frequency required"),
  route: z.string().min(1, "Route required"),
  duration: z.string().max(100).optional().or(z.literal("")),
  instructions: z.string().max(300).optional().or(z.literal("")),
});

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  medications: z
    .array(prescriptionMedItemSchema)
    .min(1, "At least one medication is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
  issueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Issue date is required"),
  acknowledgedAlerts: z.boolean().default(false),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type PrescriptionMedItemInput = z.infer<typeof prescriptionMedItemSchema>;
