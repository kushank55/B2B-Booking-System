import { requireAdmin } from "@/server/auth/guards";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireAdmin();
  if (!result.ok) {
    return result.response;
  }

  return NextResponse.json({
    user: result.user,
    businessId: result.businessId,
    business: {
      id: result.business.id,
      name: result.business.name,
      slug: result.business.slug,
      status: result.business.status,
    },
  });
}
