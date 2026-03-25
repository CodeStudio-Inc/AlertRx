import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchPatients } from "@/lib/services/patients.service";
import type { ActorContext } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["provider", "pharmacist", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  const actor: ActorContext = {
    userId: session.user.id,
    role: session.user.role as any,
  };

  const patients = await searchPatients(q, actor);
  return NextResponse.json({ patients });
}
