import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllAlertsAdmin } from "@/lib/services/alerts.service";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Bell, ShieldCheck } from "lucide-react";
import { resolveAlertAction } from "@/actions/admin.actions";

export const metadata: Metadata = { title: "Safety Alerts" };

export default async function AlertsPage() {
  const session = await auth();
  if (
    !session?.user ||
    !["provider", "admin"].includes(session.user.role)
  ) {
    redirect("/login");
  }

  const result = await getAllAlertsAdmin({ resolved: false, page: 1, limit: 50 });
  const alerts = result.data?.alerts ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Safety Alerts</h1>
        <p className="text-muted-foreground text-sm">
          {alerts.length} unresolved alert{alerts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <Card key={alert._id.toString()}>
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground capitalize">
                      {alert.type.replace(/_/g, " ")}
                    </p>
                    <span className="text-muted-foreground">·</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  {alert.patientId && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs mt-1"
                      asChild
                    >
                      <Link
                        href={`/provider/patients/${alert.patientId}`}
                      >
                        View patient
                      </Link>
                    </Button>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    const formData = new FormData();
                    formData.append("alertId", alert._id);
                    await resolveAlertAction(formData);
                  }}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Resolve
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No pending alerts"
          description="All safety alerts have been resolved."
        />
      )}
    </div>
  );
}
