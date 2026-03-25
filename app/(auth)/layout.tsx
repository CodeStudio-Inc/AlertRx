import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AlertRx</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-lg p-6 sm:p-8">
          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} AlertRx. Built for patient safety.
        </p>
      </div>
    </div>
  );
}
