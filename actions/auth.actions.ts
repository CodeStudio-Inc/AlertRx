"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validators/auth.schema";

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    if (error?.message?.includes("CredentialsSignin")) {
      return { error: "Invalid credentials. Please check your details." };
    }
    throw error; // Re-throw redirect errors
  }
}

export async function signupAction(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  role: "patient" | "provider" | "pharmacist";
}) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? "Validation failed",
    };
  }

  const { name, phone, email, password, role } = parsed.data;

  await connectDB();

  // Check for existing phone
  const existingPhone = await UserModel.findOne({ phone });
  if (existingPhone) {
    return { error: "An account with this phone number already exists." };
  }

  // Check for existing email if provided
  if (email) {
    const existingEmail = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return { error: "An account with this email already exists." };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await UserModel.create({
    name,
    phone,
    email: email?.toLowerCase() || undefined,
    password: hashedPassword,
    role,
    status: "active",
    onboardingCompleted: false,
  });

  // Sign in immediately after account creation
  try {
    await signIn("credentials", {
      identifier: phone,
      password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    throw error; // Re-throw redirect
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
