import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPatientProfile } from "@/lib/services/patients.service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Phone, Mail, MapPin, AlertCircle, Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "My Profile" };

export default async function PatientProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const result = await getPatientProfile(session.user.id);
  const profile = result.profile;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Your personal and medical information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">{session.user.name}</p>
            </div>
            {profile?.patientId && (
              <div>
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="font-medium font-mono text-sm">
                  {profile.patientId}
                </p>
              </div>
            )}
            {profile?.dateOfBirth && (
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {format(new Date(profile.dateOfBirth), "MMMM d, yyyy")}
                </p>
              </div>
            )}
            {profile?.gender && (
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">
                  {profile.gender.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{(result.user as any)?.phone ?? "No phone on file"}</span>
            </div>
            {session.user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{session.user.email}</span>
              </div>
            )}
            {profile?.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Known Allergies</p>
            {profile?.allergies && profile.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">None recorded</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Chronic Conditions
            </p>
            {profile?.chronicConditions && profile.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.chronicConditions.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">None recorded</p>
            )}
          </div>

          {profile?.pregnancyStatus &&
            profile.pregnancyStatus !== "not_applicable" && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Pregnancy Status
                </p>
                <Badge variant="outline" className="capitalize text-xs">
                  {profile.pregnancyStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {profile?.emergencyContact?.name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{profile.emergencyContact.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{profile.emergencyContact.phone}</span>
            </div>
            {profile.emergencyContact.relationship && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relationship</span>
                <span>{profile.emergencyContact.relationship}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
