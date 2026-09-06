import { requireAdmin } from "@/server/auth/guards";
import { getStaffForTenant, updateStaff } from "@/server/admin/staff";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function notFound() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function GET(_request: Request, context: RouteContext) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const staff = await getStaffForTenant(result.businessId, id);
  if (!staff) {
    return notFound();
  }

  return NextResponse.json({ staff });
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const updated = await updateStaff(result.businessId, id, {
    name: String(body.name ?? ""),
    email: body.email ? String(body.email) : undefined,
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });

  if (updated.error === "Not found.") {
    return notFound();
  }
  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  return NextResponse.json({ staff: updated.staff });
}
