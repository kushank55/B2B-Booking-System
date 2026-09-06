import { requireAdmin } from "@/server/auth/guards";
import { updateOwnProfile } from "@/server/admin/profile";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  return NextResponse.json({
    business: {
      id: result.business.id,
      name: result.business.name,
      contactEmail: result.business.contactEmail,
      contactPhone: result.business.contactPhone,
      timezone: result.business.timezone,
      slug: result.business.slug,
    },
  });
}

export async function PATCH(request: Request) {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const updated = await updateOwnProfile(result.businessId, {
    name: String(body.name ?? ""),
    contactEmail: String(body.contactEmail ?? ""),
    contactPhone: body.contactPhone ? String(body.contactPhone) : undefined,
    timezone: String(body.timezone ?? ""),
  });

  if (updated.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  return NextResponse.json({ business: updated.business });
}
