import { requireAdmin } from "@/server/auth/guards";
import { listAppointments } from "@/server/admin/appointments";
import { NextResponse } from "next/server";
import type { AppointmentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const allowed: AppointmentStatus[] = ["CONFIRMED", "CANCELLED", "COMPLETED"];

  const appointments = await listAppointments(
    result.businessId,
    result.business.timezone,
    {
      date: date || undefined,
      status: allowed.includes(status as AppointmentStatus)
        ? (status as AppointmentStatus)
        : "",
    },
  );

  return NextResponse.json({ appointments });
}
