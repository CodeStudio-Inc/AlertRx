import { z } from "zod";

export const createFacilitySchema = z.object({
  name: z.string().min(2, "Facility name is required").max(200),
  type: z.enum(["hospital", "clinic", "pharmacy", "health_center", "lab", "other"]),
  location: z.string().min(2, "Location is required").max(200),
  contactPhone: z.string().max(20).optional().or(z.literal("")),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["active", "inactive", "suspended"]),
});

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().min(1),
});

export const resolveAlertSchema = z.object({
  alertId: z.string().min(1),
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
