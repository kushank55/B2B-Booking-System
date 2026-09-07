import { requireAdmin } from "@/server/auth/guards";
import {
  getAppointmentForTenant,
  updateAppointmentStatus,
} from "@/server/admin/appointments";
import { NextResponse } from "next/server";
import type { AppointmentStatus } from "@prisma/client";

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
  const appointment = await getAppointmentForTenant(result.businessId, id);
  if (!appointment) {
    return notFound();
  }

  return NextResponse.json({ appointment });
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: string };
  const status = body.status as AppointmentStatus;

  if (status !== "CANCELLED" && status !== "COMPLETED") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updateAppointmentStatus(result.businessId, id, status);
  if (updated.error === "Not found.") {
    return notFound();
  }
  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  return NextResponse.json({ appointment: updated.appointment });
}
