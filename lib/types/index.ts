// ──────────────────────────────────────────
// Shared Domain Types for AlertRx
// These types are designed to be portable to NestJS later.
// ──────────────────────────────────────────

export type UserRole = "patient" | "provider" | "pharmacist" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";

export type AlertSeverity = "info" | "warning" | "high" | "critical";
export type AlertType =
  | "duplicate_medication"
  | "antibiotic_overlap"
  | "allergy_conflict"
  | "long_duration"
  | "missed_adherence_threshold"
  | "same_drug_active";

export type MedicationStatus = "active" | "completed" | "discontinued" | "on_hold";
export type MedicationFrequency =
  | "once_daily"
  | "twice_daily"
  | "three_times_daily"
  | "four_times_daily"
  | "every_8_hours"
  | "every_12_hours"
  | "weekly"
  | "as_needed";

export type RouteOfAdministration =
  | "oral"
  | "topical"
  | "injection"
  | "inhaled"
  | "sublingual"
  | "rectal"
  | "ophthalmic"
  | "otic"
  | "nasal"
  | "other";

export type AdherenceStatus = "taken" | "missed" | "pending" | "skipped";
export type PrescriptionStatus = "active" | "fulfilled" | "cancelled" | "expired";

export type FacilityType =
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "health_center"
  | "lab"
  | "other";

// ──────────────────────────────────────────
// Actor context — passed through service calls
// Mirrors how NestJS uses request user objects
// ──────────────────────────────────────────
export interface ActorContext {
  userId: string;
  role: UserRole;
  name?: string;
}

// ──────────────────────────────────────────
// Service Result Wrappers
// ──────────────────────────────────────────
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ──────────────────────────────────────────
// Patient Summary (used in provider/pharmacist views)
// ──────────────────────────────────────────
export interface PatientSummary {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  activeMedications: number;
  recentPrescriptions: number;
  unresolvedAlerts: number;
  adherenceScore?: number;
  lastSeen?: Date;
}

// ──────────────────────────────────────────
// Alert preview before saving prescription
// ──────────────────────────────────────────
export interface AlertPreview {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
}

// ──────────────────────────────────────────
// Dashboard metric
// ──────────────────────────────────────────
export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
}
