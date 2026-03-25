import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile } from "@/lib/services/uploads.service";
import type { UploadResourceType } from "@/models/Upload";
import type { ActorContext } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const resourceType = (formData.get("resourceType") as UploadResourceType) ?? "other";
    const patientId = formData.get("patientId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const actor: ActorContext = {
      userId: session.user.id,
      role: session.user.role as any,
    };

    const result = await uploadFile(
      {
        file: buffer,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        resourceType,
        patientId: patientId ?? undefined,
      },
      actor
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
