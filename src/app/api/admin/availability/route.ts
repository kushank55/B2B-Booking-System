import { requireAdmin } from "@/server/auth/guards";
import {
  listAvailability,
  replaceAvailability,
  type WeekDayHours,
} from "@/server/bookings/availability";
import { NextResponse } from "next/server";

function staffScope(value: string | null) {
  return value && value.length > 0 ? value : null;
}

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const staffId = staffScope(new URL(request.url).searchParams.get("staffId"));
  const rules = await listAvailability(result.businessId, staffId);
  return NextResponse.json({ rules });
}

export async function PUT(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const body = (await request.json()) as {
    staffId?: string | null;
    days?: WeekDayHours[];
  };

  const updated = await replaceAvailability(
    result.businessId,
    staffScope(body.staffId ?? null),
    Array.isArray(body.days) ? body.days : [],
  );

  if (updated.error === "Not found.") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  const rules = await listAvailability(
    result.businessId,
    staffScope(body.staffId ?? null),
  );
  return NextResponse.json({ rules });
}
