import { requireOwner } from "@/server/auth/guards";
import {
  createBusinessWithAdmin,
  listBusinesses,
} from "@/server/tenants/service";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireOwner();
  if (!result.ok) {
    return result.response;
  }

  const businesses = await listBusinesses();
  return NextResponse.json({ businesses });
}

export async function POST(request: Request) {
  const result = await requireOwner();
  if (!result.ok) {
    return result.response;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const created = await createBusinessWithAdmin({
    name: String(body.name ?? ""),
    contactEmail: String(body.contactEmail ?? ""),
    contactPhone: body.contactPhone ? String(body.contactPhone) : undefined,
    timezone: String(body.timezone ?? ""),
    slug: body.slug ? String(body.slug) : undefined,
    status: body.status === "DISABLED" ? "DISABLED" : "ACTIVE",
    adminName: String(body.adminName ?? ""),
    adminEmail: String(body.adminEmail ?? ""),
    adminPassword: String(body.adminPassword ?? ""),
  });

  if (created.error) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ business: created.business }, { status: 201 });
}
