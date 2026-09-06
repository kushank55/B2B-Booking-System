import { getActiveBusinessBySlug } from "@/server/tenants/active";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const business = await getActiveBusinessBySlug(slug);

  if (!business) {
    return NextResponse.json(
      { error: "This business is not available." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    business: {
      name: business.name,
      slug: business.slug,
      timezone: business.timezone,
    },
  });
}
