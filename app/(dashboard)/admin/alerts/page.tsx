import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllAlertsAdmin } from "@/lib/services/alerts.service";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Bell, ShieldCheck } from "lucide-react";
import { resolveAlertAction } from "@/actions/admin.actions";

export const metadata: Metadata = { title: "All Alerts — Admin" };

interface PageProps {
  searchParams: Promise<{ resolved?: string }>;
}

export default async function AdminAlertsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { resolved } = await searchParams;
  const showResolved = resolved === "true";

  const allAlerts = await getAllAlertsAdmin(100);
  const alerts = allAlerts.filter((a: any) => a.resolved === showResolved);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety Alerts</h1>
          <p className="text-muted-foreground text-sm">
            {alerts.length} {showResolved ? "resolved" : "unresolved"} alert
            {alerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showResolved ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/admin/alerts">Unresolved</Link>
          </Button>
          <Button
            variant={showResolved ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/admin/alerts?resolved=true">Resolved</Link>
          </Button>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <Card key={alert._id.toString()}>
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {alert.description ?? alert.message}
                    </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                    >
                      {alert.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  {alert.patientId && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs mt-1"
                      asChild
                    >
                      <Link href={`/provider/patients/${alert.patientId?._id ?? alert.patientId}`}>
                        View patient
                      </Link>
                    </Button>
                  )}
                  {alert.resolved && alert.resolvedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolved {format(new Date(alert.resolvedAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                {!alert.resolved && (
                  <form
                    action={async () => {
                      "use server";
                      await resolveAlertAction(alert._id.toString());
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={
            showResolved
              ? "No resolved alerts"
              : "No pending alerts"
          }
          description={
            showResolved
              ? "No alerts have been resolved yet."
              : "All safety alerts have been resolved."
          }
        />
      )}
    </div>
  );
}
