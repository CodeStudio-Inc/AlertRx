import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Bell,
  ClipboardList,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  Pill,
} from "lucide-react";

const FEATURES = [
  {
    icon: Pill,
    title: "Medication Logging",
    description:
      "Patients and providers log medications with dosage, frequency, and route details—centralized and always current.",
  },
  {
    icon: Bell,
    title: "Real-Time Safety Alerts",
    description:
      "Rule-based engine flags duplicate drugs, antibiotic overlaps, allergy conflicts, and unusually long durations.",
  },
  {
    icon: TrendingUp,
    title: "Adherence Tracking",
    description:
      "Automatic dose schedules, one-tap mark as taken, and adherence scores keep everyone accountable.",
  },
  {
    icon: ClipboardList,
    title: "Digital Prescriptions",
    description:
      "Providers issue multi-drug prescriptions with inline alert previews before finalizing—safety first.",
  },
  {
    icon: Users,
    title: "Multi-Role Dashboards",
    description:
      "Tailored views for patients, providers, pharmacists, and admins so every stakeholder sees what matters.",
  },
  {
    icon: Activity,
    title: "Pharmacist Workflow",
    description:
      "Search patients, verify prescriptions, record dispenses, and flag high-risk cases for follow-up.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">AlertRx</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Badge variant="outline" className="mb-4 gap-1">
              <ShieldCheck className="h-3 w-3" />
              Medication Safety Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
              Medication adherence,{" "}
              <span className="text-primary">done right.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
              AlertRx connects patients, providers, and pharmacists in a unified
              platform that tracks adherence, prevents drug safety issues, and
              improves health outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
            {[
              { value: "4 Roles", label: "Patient · Provider · Pharmacist · Admin" },
              { value: "Real-Time", label: "Safety alert engine" },
              { value: "6 Rules", label: "Drug interaction checks" },
              { value: "Open Source", label: "Extendable architecture" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything your care team needs
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                From first prescription to final dispense, AlertRx keeps the
                entire medication journey safe and transparent.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to improve medication safety?
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Join AlertRx today and give your care team the tools they need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="gap-2"
              >
                <Link href="/signup">
                  Get Started — It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>AlertRx &copy; {new Date().getFullYear()}</span>
          </div>
          <p>Built for patient safety.</p>
        </div>
      </footer>
    </div>
  );
}
