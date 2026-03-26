import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardMetric } from "@/lib/types";
import type { ComponentType } from "react";

type LucideIcon = ComponentType<{ className?: string }>;

type MetricCardProps = {
  metric?: DashboardMetric;
  title?: string;
  value?: string | number;
  description?: string;
  variant?: "default" | "warning";
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
};

export function MetricCard({
  metric,
  title,
  value,
  description,
  variant,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  const resolvedMetric: DashboardMetric = metric ?? {
    label: title ?? "Metric",
    value: value ?? 0,
    changeLabel: description,
  };

  const resolvedIconColor =
    iconColor ?? (variant === "warning" ? "text-amber-600" : "text-primary");
  const resolvedIconBg =
    iconBg ?? (variant === "warning" ? "bg-amber-100" : "bg-primary/10");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {resolvedMetric.label}
        </CardTitle>
        {Icon && (
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center",
              resolvedIconBg
            )}
          >
            <Icon className={cn("h-5 w-5", resolvedIconColor)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{resolvedMetric.value}</div>
        {resolvedMetric.changeLabel && (
          <p
            className={cn(
              "text-xs mt-1",
              resolvedMetric.trend === "up"
                ? "text-green-600"
                : resolvedMetric.trend === "down"
                ? "text-red-600"
                : "text-muted-foreground"
            )}
          >
            {resolvedMetric.changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface SimpleMetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export function SimpleMetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  description,
}: SimpleMetricCardProps) {
  return (
    <MetricCard
      metric={{ label, value, changeLabel: description }}
      icon={Icon}
      iconColor={iconColor}
      iconBg={iconBg}
    />
  );
}
