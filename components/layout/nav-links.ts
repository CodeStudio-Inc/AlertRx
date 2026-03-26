import type { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  Pill,
  CheckSquare,
  Upload,
  User,
  Search,
  FileText,
  Bell,
  Package,
  ClipboardList,
  Users,
  Building2,
  AlertCircle,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_LINKS: Record<UserRole, NavItem[]> = {
  patient: [
    { label: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { label: "Medications", href: "/medications", icon: Pill },
    { label: "Adherence", href: "/adherence", icon: CheckSquare },
    { label: "Uploads", href: "/uploads", icon: Upload },
    { label: "My Profile", href: "/profile", icon: User },
  ],
  provider: [
    { label: "Dashboard", href: "/dashboard/provider", icon: LayoutDashboard },
    { label: "Search Patient", href: "/provider/search", icon: Search },
    { label: "Prescriptions", href: "/provider/prescriptions", icon: FileText },
    { label: "Alerts", href: "/provider/alerts", icon: Bell },
  ],
  pharmacist: [
    {
      label: "Dashboard",
      href: "/dashboard/pharmacist",
      icon: LayoutDashboard,
    },
    { label: "Search Patient", href: "/pharmacist/search", icon: Search },
    { label: "Dispense", href: "/pharmacist/dispense/new", icon: Package },
    { label: "Records", href: "/pharmacist/records", icon: ClipboardList },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Facilities", href: "/admin/facilities", icon: Building2 },
    { label: "Alerts", href: "/admin/alerts", icon: AlertCircle },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};
