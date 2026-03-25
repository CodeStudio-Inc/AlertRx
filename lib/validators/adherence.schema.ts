import { z } from "zod";

export const markDoseSchema = z.object({
  adherenceLogId: z.string().min(1),
  status: z.enum(["taken", "missed", "skipped"]),
  notes: z.string().max(200).optional().or(z.literal("")),
});

export const dispenseRecordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  prescriptionId: z.string().optional().or(z.literal("")),
  medicationName: z.string().min(2, "Medication name is required").max(200),
  quantity: z.string().min(1, "Quantity is required").max(100),
  dispensedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Dispense date is required"),
  notes: z.string().max(300).optional().or(z.literal("")),
  flaggedForReview: z.boolean().default(false),
  flagReason: z.string().max(300).optional().or(z.literal("")),
});

export type MarkDoseInput = z.infer<typeof markDoseSchema>;
export type DispenseRecordInput = z.infer<typeof dispenseRecordSchema>;
