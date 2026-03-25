import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllUsers } from "@/lib/services/patients.service";
import { UsersTable } from "@/components/admin/users-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "User Management" };

interface PageProps {
  searchParams: Promise<{ role?: string; status?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { role, status } = await searchParams;
  const result = await getAllUsers({ role, status });
  const users = result.data ?? [];

  const counts = {
    all: users.length,
    patient: users.filter((u: any) => u.role === "patient").length,
    provider: users.filter((u: any) => u.role === "provider").length,
    pharmacist: users.filter((u: any) => u.role === "pharmacist").length,
    admin: users.filter((u: any) => u.role === "admin").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-sm">
          {users.length} user{users.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([r, count]) => (
          <a key={r} href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}>
            <Badge
              variant={role === r || (r === "all" && !role) ? "default" : "outline"}
              className="capitalize cursor-pointer"
            >
              {r} ({count})
            </Badge>
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
