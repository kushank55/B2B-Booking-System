import { requireAdmin } from "@/server/auth/guards";
import { createStaff, listStaff } from "@/server/admin/staff";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const staff = await listStaff(result.businessId);
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const created = await createStaff(result.businessId, {
    name: String(body.name ?? ""),
    email: body.email ? String(body.email) : undefined,
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });

  if (created.error) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ staff: created.staff }, { status: 201 });
}
