import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AlertRx — Medication Adherence Platform",
    template: "%s | AlertRx",
  },
  description:
    "A digital health platform for medication adherence tracking, prescription safety, and patient-provider collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
