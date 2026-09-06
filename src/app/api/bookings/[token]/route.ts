import {
  cancelAppointmentByToken,
  getAppointmentByToken,
} from "@/server/bookings/create";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const appointment = await getAppointmentByToken(token);

  if (!appointment) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    appointment: {
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      status: appointment.status,
      service: appointment.service.name,
      staff: appointment.staff.name,
      business: appointment.business.name,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const result = await cancelAppointmentByToken(token);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    appointment: { status: result.appointment.status },
  });
}
