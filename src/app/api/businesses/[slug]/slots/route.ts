import { getSlotsForSlug } from "@/server/bookings/availability";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId") ?? "";
  const date = url.searchParams.get("date") ?? "";
  const staffId = url.searchParams.get("staffId") ?? undefined;

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId and date are required." },
      { status: 400 },
    );
  }

  const result = await getSlotsForSlug({
    slug,
    serviceId,
    date,
    staffId,
  });

  if ("error" in result && result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
