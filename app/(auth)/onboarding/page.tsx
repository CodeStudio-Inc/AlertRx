import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingPatientForm } from "@/components/auth/onboarding-patient-form";
import { OnboardingProviderForm } from "@/components/auth/onboarding-provider-form";

export const metadata: Metadata = {
  title: "Complete Your Profile",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  const role = session.user.role;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Complete your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "patient"
            ? "Tell us a bit about yourself so we can personalise your care."
            : "Provide your professional details to get started."}
        </p>
      </div>

      {role === "patient" ? (
        <OnboardingPatientForm />
      ) : role === "provider" || role === "pharmacist" ? (
        <OnboardingProviderForm />
      ) : (
        // Admin — skip onboarding directly
        <div className="text-center text-sm text-muted-foreground py-4">
          Redirecting to your dashboard…
        </div>
      )}
    </div>
  );
}
