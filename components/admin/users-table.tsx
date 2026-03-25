"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, CheckCircle, XCircle, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateUserStatusAction } from "@/actions/admin.actions";
import { format } from "date-fns";

interface UserRow {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  status: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: UserRow[];
}

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "destructive",
  provider: "default",
  pharmacist: "secondary",
  patient: "outline",
};

function UserActions({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: "active" | "suspended" | "inactive") {
    startTransition(async () => {
      const result = await updateUserStatusAction({ userId: user._id, status });
      if (!result.success) {
        toast.error(result.error ?? "Failed to update user");
      } else {
        toast.success(`User ${status} successfully`);
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.status !== "active" && (
          <DropdownMenuItem
            className="gap-2"
            onClick={() => updateStatus("active")}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            Activate
          </DropdownMenuItem>
        )}
        {user.status !== "suspended" && (
          <DropdownMenuItem
            className="gap-2 text-yellow-600"
            onClick={() => updateStatus("suspended")}
          >
            <Shield className="h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        )}
        {user.status !== "inactive" && (
          <DropdownMenuItem
            className="gap-2 text-destructive"
            onClick={() => updateStatus("inactive")}
          >
            <XCircle className="h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Onboarded</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const initials = user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email ?? user.phone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ROLE_VARIANT[user.role] ?? "outline"}
                    className="capitalize text-xs"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "active"
                        ? "default"
                        : user.status === "suspended"
                        ? "secondary"
                        : "outline"
                    }
                    className="capitalize text-xs"
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.onboardingCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
