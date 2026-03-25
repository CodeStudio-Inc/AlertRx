import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDispenseRecordsForPharmacist } from "@/lib/services/adherence.service";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ClipboardList, Flag } from "lucide-react";

export const metadata: Metadata = { title: "Dispense Records" };

export default async function DispenseRecordsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "pharmacist") redirect("/login");

  const result = await getDispenseRecordsForPharmacist(session.user.id);
  const records = result.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispense Records</h1>
        <p className="text-muted-foreground text-sm">
          {records.length} total record{records.length !== 1 ? "s" : ""}
        </p>
      </div>

      {records.length > 0 ? (
        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record: any) => (
                  <TableRow key={record._id.toString()}>
                    <TableCell className="font-medium">
                      {record.patientName ?? "—"}
                    </TableCell>
                    <TableCell>{record.medicationName}</TableCell>
                    <TableCell>{record.quantityDispensed}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(record.dispensedAt), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {record.flaggedForReview ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Flag className="h-3 w-3" />
                          Flagged
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No dispense records"
          description="Records you create will appear here."
        />
      )}
    </div>
  );
}
