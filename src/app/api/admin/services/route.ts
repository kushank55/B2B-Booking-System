import { requireAdmin } from "@/server/auth/guards";
import { createService, listServices } from "@/server/admin/services";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const services = await listServices(result.businessId);
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const created = await createService(result.businessId, {
    name: String(body.name ?? ""),
    durationMinutes: Number(body.durationMinutes),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });

  if (created.error) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ service: created.service }, { status: 201 });
}
