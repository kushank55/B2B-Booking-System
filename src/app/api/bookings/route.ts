import { createBooking } from "@/server/bookings/create";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await createBooking({
    slug: String(body.slug ?? ""),
    serviceId: String(body.serviceId ?? ""),
    staffId: String(body.staffId ?? ""),
    startAt: String(body.startAt ?? ""),
    customerName: String(body.customerName ?? ""),
    customerEmail: String(body.customerEmail ?? ""),
    customerPhone: body.customerPhone ? String(body.customerPhone) : undefined,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      appointment: {
        id: result.appointment.id,
        manageToken: result.appointment.manageToken,
        startAt: result.appointment.startAt.toISOString(),
        endAt: result.appointment.endAt.toISOString(),
        status: result.appointment.status,
      },
    },
    { status: 201 },
  );
}
