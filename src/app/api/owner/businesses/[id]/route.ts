import { requireOwner } from "@/server/auth/guards";
import { getBusiness, setBusinessStatus } from "@/server/tenants/service";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const result = await requireOwner();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const business = await getBusiness(id);

  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  return NextResponse.json({ business });
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireOwner();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: string };
  const status = body.status === "DISABLED" ? "DISABLED" : "ACTIVE";
  const updated = await setBusinessStatus(id, status);

  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 404 });
  }

  return NextResponse.json({ business: updated.business });
}
