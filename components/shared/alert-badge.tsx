import { Badge } from "@/components/ui/badge";
import type { AlertSeverity } from "@/lib/types";

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; variant: "destructive" | "warning" | "info" | "default" }
> = {
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  warning: { label: "Warning", variant: "warning" },
  info: { label: "Info", variant: "info" },
};

interface AlertBadgeProps {
  severity: AlertSeverity;
}

export function AlertBadge({ severity }: AlertBadgeProps) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;
  return (
    <Badge variant={config.variant as any}>{config.label}</Badge>
  );
}
