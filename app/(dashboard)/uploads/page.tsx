import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUploadsForOwner } from "@/lib/services/uploads.service";
import { FileUpload } from "@/components/shared/file-upload";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download, Image, File } from "lucide-react";

export const metadata: Metadata = { title: "My Documents" };

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export default async function UploadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getUploadsForOwner(session.user.id);
  const uploads = result.data ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm">
          Upload prescriptions, lab results, and other health documents.
        </p>
      </div>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Document</CardTitle>
          <CardDescription>
            Accepted: images (JPG, PNG, WebP) and PDF files up to 10 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            resourceType="prescription"
            onUploadComplete={() => {}}
          />
        </CardContent>
      </Card>

      {/* File list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Uploaded Files ({uploads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length > 0 ? (
            <div className="divide-y">
              {uploads.map((upload) => (
                <div
                  key={upload._id?.toString()}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileIcon mimeType={upload.mimeType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {upload.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(upload.createdAt as any), "MMM d, yyyy")} &bull;{" "}
                      {(upload.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {upload.resourceType.replace(/_/g, " ")}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a
                      href={upload.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents uploaded"
              description="Upload a document using the form above."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
