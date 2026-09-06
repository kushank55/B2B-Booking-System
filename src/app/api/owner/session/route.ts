import { requireOwner } from "@/server/auth/guards";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireOwner();
  if (!result.ok) {
    return result.response;
  }

  return NextResponse.json({ user: result.user });
}
