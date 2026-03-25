import { format, formatDistanceToNow, differenceInYears } from "date-fns";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateAge(dob: Date | string): number {
  return differenceInYears(new Date(), new Date(dob));
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}

export function generatePatientId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `ALX-${year}-${random}`;
}

export function calculateAdherenceScore(taken: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((taken / total) * 100);
}

export function getAdherenceLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function getAdherenceColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export function truncate(str: string, maxLen = 60): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toTitleCase(str: string): string {
  return str
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

export function formatFrequency(freq: string): string {
  const map: Record<string, string> = {
    once_daily: "Once daily",
    twice_daily: "Twice daily",
    three_times_daily: "Three times daily",
    four_times_daily: "Four times daily",
    every_8_hours: "Every 8 hours",
    every_12_hours: "Every 12 hours",
    weekly: "Weekly",
    as_needed: "As needed (PRN)",
  };
  return map[freq] ?? toTitleCase(freq);
}

export function formatRoute(route: string): string {
  const map: Record<string, string> = {
    oral: "Oral",
    topical: "Topical",
    injection: "Injection",
    inhaled: "Inhaled",
    sublingual: "Sublingual",
    rectal: "Rectal",
    ophthalmic: "Ophthalmic",
    otic: "Otic (Ear)",
    nasal: "Nasal",
    other: "Other",
  };
  return map[route] ?? toTitleCase(route);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
