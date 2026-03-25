/**
 * AlertRx — Seed Script
 * Run: npm run seed
 *
 * Creates: 1 admin, 2 providers, 1 pharmacist, 5 patients, 2 facilities, medications,
 * prescriptions, adherence logs, and sample alerts.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db/connect";
import { UserModel as User } from "../models/User";
import { PatientProfileModel as PatientProfile } from "../models/PatientProfile";
import { ProviderProfileModel as ProviderProfile } from "../models/ProviderProfile";
import { FacilityModel as Facility } from "../models/Facility";
import { MedicationLogModel as MedicationLog } from "../models/MedicationLog";
import { PrescriptionModel as Prescription } from "../models/Prescription";
import { AdherenceLogModel as AdherenceLog } from "../models/AdherenceLog";
import { AlertModel as Alert } from "../models/Alert";
import { DispenseRecordModel as DispenseRecord } from "../models/DispenseRecord";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function subDays(date: Date, days: number) {
  return addDays(date, -days);
}

const HASH_ROUNDS = 12;
const PASSWORD = "Password123!";

async function hash(pass: string) {
  return bcrypt.hash(pass, HASH_ROUNDS);
}

async function main() {
  console.log("🌱 Connecting to MongoDB…");
  await connectDB();
  console.log("✅ Connected.");

  // Wipe existing demo data
  console.log("🗑️  Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    PatientProfile.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Facility.deleteMany({}),
    MedicationLog.deleteMany({}),
    Prescription.deleteMany({}),
    AdherenceLog.deleteMany({}),
    Alert.deleteMany({}),
    DispenseRecord.deleteMany({}),
  ]);

  const pw = await hash(PASSWORD);

  // ── ADMIN ────────────────────────────────────────
  const admin = await User.create({
    name: "System Admin",
    email: "admin@alertrx.dev",
    phone: "+10000000000",
    password: pw,
    role: "admin",
    status: "active",
    onboardingCompleted: true,
  });
  console.log("👤 Admin created:", admin.email);

  // ── FACILITIES ───────────────────────────────────
  const [facilityA, facilityB] = await Facility.create([
    {
      name: "City General Hospital",
      type: "hospital",
      location: "Lagos, Nigeria",
      contactPhone: "+2341234567890",
      createdBy: admin._id,
    },
    {
      name: "Westside Clinic",
      type: "clinic",
      location: "Abuja, Nigeria",
      contactPhone: "+2349876543210",
      createdBy: admin._id,
    },
  ]);
  console.log("🏥 Facilities created:", facilityA.name, facilityB.name);

  // ── PROVIDERS ────────────────────────────────────
  const [prov1, prov2] = await User.create([
    {
      name: "Dr. Sarah Okonkwo",
      email: "sarah.okonkwo@alertrx.dev",
      phone: "+2348011111111",
      password: pw,
      role: "provider",
      status: "active",
      onboardingCompleted: true,
    },
    {
      name: "Dr. James Adeyemi",
      email: "james.adeyemi@alertrx.dev",
      phone: "+2348022222222",
      password: pw,
      role: "provider",
      status: "active",
      onboardingCompleted: true,
    },
  ]);

  await ProviderProfile.create([
    {
      userId: prov1._id,
      profession: "doctor",
      licenseNumber: "MD-2022-00101",
      facilityId: facilityA._id,
      facilityName: facilityA.name,
      facilityType: facilityA.type,
      facilityLocation: facilityA.location,
    },
    {
      userId: prov2._id,
      profession: "specialist",
      licenseNumber: "SP-2021-00234",
      facilityId: facilityB._id,
      facilityName: facilityB.name,
      facilityType: facilityB.type,
      facilityLocation: facilityB.location,
    },
  ]);
  console.log("👨‍⚕️ Providers created:", prov1.name, prov2.name);

  // ── PHARMACIST ───────────────────────────────────
  const pharmacist = await User.create({
    name: "Pharm. Ngozi Eze",
    email: "ngozi.eze@alertrx.dev",
    phone: "+2348033333333",
    password: pw,
    role: "pharmacist",
    status: "active",
    onboardingCompleted: true,
  });

  await ProviderProfile.create({
    userId: pharmacist._id,
    profession: "pharmacist" as any,
    licenseNumber: "PH-2023-00055",
    facilityId: facilityA._id,
    facilityName: facilityA.name,
    facilityType: facilityA.type,
  });
  console.log("💊 Pharmacist created:", pharmacist.name);

  // ── PATIENTS ─────────────────────────────────────
  const patientSeeds = [
    {
      name: "Amina Bello",
      phone: "+2348044444444",
      email: "amina.bello@example.com",
      allergies: ["penicillin", "latex"],
      chronicConditions: ["hypertension", "diabetes type 2"],
      gender: "female" as const,
    },
    {
      name: "Chukwuemeka Obi",
      phone: "+2348055555555",
      email: "emeka.obi@example.com",
      allergies: [],
      chronicConditions: ["asthma"],
      gender: "male" as const,
    },
    {
      name: "Fatima Aliyu",
      phone: "+2348066666666",
      allergies: ["sulfa drugs"],
      chronicConditions: [],
      gender: "female" as const,
    },
    {
      name: "Tunde Adeyemi",
      phone: "+2348077777777",
      allergies: [],
      chronicConditions: ["hypertension"],
      gender: "male" as const,
    },
    {
      name: "Grace Okafor",
      phone: "+2348088888888",
      email: "grace.okafor@example.com",
      allergies: ["aspirin"],
      chronicConditions: ["migraine"],
      gender: "female" as const,
    },
  ];

  const patients = await User.create(
    patientSeeds.map((p, i) => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      password: pw,
      role: "patient",
      status: "active",
      onboardingCompleted: true,
    }))
  );

  const counter = { value: 1 };
  await Promise.all(
    patients.map((p, i) =>
      PatientProfile.create({
        userId: p._id,
        patientId: `ALX-${new Date().getFullYear()}-${String(counter.value++ + i).padStart(5, "0")}`,
        dateOfBirth: new Date(
          1980 + i * 3,
          (i * 2) % 12,
          (i * 5 + 1) % 28 + 1
        ),
        gender: patientSeeds[i].gender,
        allergies: patientSeeds[i].allergies,
        chronicConditions: patientSeeds[i].chronicConditions,
        pregnancyStatus: "not_applicable",
      })
    )
  );
  console.log(`👥 ${patients.length} patients created`);

  // ── MEDICATIONS ──────────────────────────────────
  const today = new Date();
  const medicationData = [
    // Amina — hypertensive + diabetic, potential conflicts
    {
      patientUser: patients[0],
      drugs: [
        { drugName: "Amlodipine", dosage: "5mg", frequency: "once_daily", route: "oral", startDate: subDays(today, 30) },
        { drugName: "Metformin", dosage: "500mg", frequency: "twice_daily", route: "oral", startDate: subDays(today, 30) },
        { drugName: "Lisinopril", dosage: "10mg", frequency: "once_daily", route: "oral", startDate: subDays(today, 15) },
      ],
    },
    // Chukwuemeka — asthmatic
    {
      patientUser: patients[1],
      drugs: [
        { drugName: "Salbutamol Inhaler", dosage: "100mcg", frequency: "as_needed", route: "inhaled", startDate: subDays(today, 60) },
        { drugName: "Budesonide Inhaler", dosage: "200mcg", frequency: "twice_daily", route: "inhaled", startDate: subDays(today, 60) },
      ],
    },
    // Fatima
    {
      patientUser: patients[2],
      drugs: [
        { drugName: "Amoxicillin", dosage: "500mg", frequency: "three_times_daily", route: "oral", startDate: subDays(today, 5), endDate: addDays(today, 2) },
      ],
    },
    // Tunde — hypertension + duplicate test
    {
      patientUser: patients[3],
      drugs: [
        { drugName: "Amlodipine", dosage: "10mg", frequency: "once_daily", route: "oral", startDate: subDays(today, 45) },
        { drugName: "Hydrochlorothiazide", dosage: "25mg", frequency: "once_daily", route: "oral", startDate: subDays(today, 45) },
      ],
    },
    // Grace — migraine
    {
      patientUser: patients[4],
      drugs: [
        { drugName: "Sumatriptan", dosage: "50mg", frequency: "as_needed", route: "oral", startDate: subDays(today, 20) },
        { drugName: "Propranolol", dosage: "40mg", frequency: "twice_daily", route: "oral", startDate: subDays(today, 20) },
      ],
    },
  ];

  const createdMeds: any[] = [];
  for (const { patientUser, drugs } of medicationData) {
    const profile = await PatientProfile.findOne({ userId: patientUser._id }).lean();
    for (const drug of drugs) {
      const med = await MedicationLog.create({
        patientId: patientUser._id,
        createdByUserId: patientUser._id,
        medicationName: drug.drugName,
        dosage: drug.dosage,
        frequency: drug.frequency,
        route: drug.route,
        startDate: drug.startDate,
        endDate: (drug as any).endDate,
        status: "active",
      });
      createdMeds.push({ med, patientId: patientUser._id });
    }
  }
  console.log(`💉 ${createdMeds.length} medications created`);

  // ── ADHERENCE LOGS (past 7 days for selected meds) ───
  let adherenceCount = 0;
  const DOSE_HOURS: Record<string, number[]> = {
    once_daily: [8],
    twice_daily: [8, 20],
    three_times_daily: [8, 14, 20],
    four_times_daily: [6, 12, 18, 22],
    every_6_hours: [6, 12, 18, 24],
    every_8_hours: [8, 16, 24],
    weekly: [8],
    as_needed: [],
  };

  for (const { med, patientId } of createdMeds) {
    const hours = DOSE_HOURS[med.frequency] ?? [];
    if (hours.length === 0) continue;

    for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
      const day = subDays(today, daysAgo);
      for (const hour of hours) {
        const scheduledAt = new Date(day);
        scheduledAt.setHours(hour, 0, 0, 0);
        // Simulate ~80% adherence
        const taken = Math.random() < 0.8;
        const log = await AdherenceLog.create({
          patientId,
          medicationLogId: med._id,
          scheduledAt,
          takenAt: taken ? new Date(scheduledAt.getTime() + Math.random() * 30 * 60000) : undefined,
          status: taken ? "taken" : "missed",
        });
        adherenceCount++;
      }
    }
  }
  console.log(`📅 ${adherenceCount} adherence logs created (past 7 days)`);

  // ── PRESCRIPTION (Amina from Dr. Okonkwo) ────────
  const aminaProfile = await PatientProfile.findOne({ userId: patients[0]._id }).lean();
  await Prescription.create({
    patientId: patients[0]._id,
    providerId: prov1._id,
    facilityId: facilityA._id,
    medications: [
      {
        medicationName: "Amlodipine",
        dosage: "5mg",
        frequency: "once_daily",
        route: "oral",
        instructions: "Take in the morning",
      },
      {
        medicationName: "Metformin",
        dosage: "500mg",
        frequency: "twice_daily",
        route: "oral",
        instructions: "Take with meals",
      },
    ],
    notes: "Monitor BP and blood glucose weekly",
    status: "active",
    acknowledgedAlerts: false,
  });
  console.log("📄 Prescription created for Amina");

  // ── ALERTS ───────────────────────────────────────
  await Alert.create([
    {
      patientId: patients[0]._id,
      type: "allergy_conflict",
      severity: "critical",
      title: "Possible Allergy Conflict",
      description:
        "Patient has documented penicillin allergy — verify cross-reactivity before prescribing beta-lactams.",
      resolved: false,
    },
    {
      patientId: patients[0]._id,
      type: "duplicate_medication",
      severity: "high",
      title: "Possible Duplicate Medication",
      description:
        "Amlodipine appears on two active medication records. Review for duplicate entry.",
      resolved: false,
    },
    {
      patientId: patients[3]._id,
      type: "duplicate_medication",
      severity: "warning",
      title: "Potential Duplicate Regimen",
      description: "Amlodipine 10mg duplicated — patient may be on two antihypertensive regimens.",
      resolved: false,
    },
  ]);
  console.log("🚨 Sample alerts created");

  // ── DISPENSE RECORD ───────────────────────────────
  await DispenseRecord.create({
    patientId: patients[0]._id,
    pharmacistId: pharmacist._id,
    medicationName: "Amlodipine 5mg",
    quantity: "30 tablets",
    dispensedAt: subDays(today, 2),
    flaggedForReview: false,
    notes: "Patient counselled on BP monitoring",
  });
  console.log("🏪 Dispense record created");

  console.log("\n✅ Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("Demo accounts (all passwords: Password123!)");
  console.log("─────────────────────────────────────────");
  console.log(`Admin       : admin@alertrx.dev`);
  console.log(`Provider 1  : sarah.okonkwo@alertrx.dev`);
  console.log(`Provider 2  : james.adeyemi@alertrx.dev`);
  console.log(`Pharmacist  : ngozi.eze@alertrx.dev`);
  console.log(`Patient 1   : ${patients[0].phone}  (${patients[0].name})`);
  console.log(`Patient 2   : ${patients[1].phone}  (${patients[1].name})`);
  console.log(`Patient 3   : ${patients[2].phone}  (${patients[2].name})`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
