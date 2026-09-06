import { requireAdmin } from "@/server/auth/guards";
import { getServiceForTenant, updateService } from "@/server/admin/services";
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
  const service = await getServiceForTenant(result.businessId, id);
  if (!service) {
    return notFound();
  }

  return NextResponse.json({ service });
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const updated = await updateService(result.businessId, id, {
    name: String(body.name ?? ""),
    durationMinutes: Number(body.durationMinutes),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });

  if (updated.error === "Not found.") {
    return notFound();
  }
  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  return NextResponse.json({ service: updated.service });
}
