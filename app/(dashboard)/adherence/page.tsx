import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTodaysDoses, getAdherenceScore } from "@/lib/services/adherence.service";
import { AdherenceChecklist } from "@/components/patient/adherence-checklist";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Adherence Tracker" };

export default async function AdherencePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const [dosesResult, scoreResult] = await Promise.all([
    getTodaysDoses(session.user.id),
    getAdherenceScore(session.user.id, 30),
  ]);

  const doses = dosesResult.data ?? [];
  const score = scoreResult.data ?? 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Adherence Tracker
        </h1>
        <p className="text-muted-foreground text-sm">
          Log your doses daily to maintain a healthy adherence score.
        </p>
      </div>

      {/* Score banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            30-Day Adherence Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Progress value={score} className="flex-1 mr-4" />
            <Badge
              variant={
                score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"
              }
              className="text-sm font-bold min-w-[52px] justify-center"
            >
              {score}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {score >= 80
              ? "Excellent! Keep it up."
              : score >= 50
              ? "Good — aim for 80%+ for best outcomes."
              : "Try to take your medications as scheduled."}
          </p>
        </CardContent>
      </Card>

      {/* Today's doses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
          <CardDescription>
            Mark each dose when you take it or choose to skip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdherenceChecklist doses={doses as any} date={new Date()} />
        </CardContent>
      </Card>
    </div>
  );
}
