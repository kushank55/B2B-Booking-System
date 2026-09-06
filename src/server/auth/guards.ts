import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Business, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string | null;
};

type GuardReason = "unauthenticated" | "forbidden" | "disabled";
type GuardFailure = { ok: false; reason: GuardReason; response: NextResponse };
type OwnerSuccess = { ok: true; user: AuthUser };
type AdminSuccess = {
  ok: true;
  user: AuthUser;
  businessId: string;
  business: Business;
};

function unauthorized(): GuardFailure {
  return {
    ok: false,
    reason: "unauthenticated",
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

function forbidden(): GuardFailure {
  return {
    ok: false,
    reason: "forbidden",
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}

function disabled(): GuardFailure {
  return {
    ok: false,
    reason: "disabled",
    response: NextResponse.json(
      { error: "This business is disabled." },
      { status: 403 },
    ),
  };
}

async function currentUser(): Promise<AuthUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.email || !user.role) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    role: user.role,
    businessId: user.businessId,
  };
}

export async function requireOwner(): Promise<OwnerSuccess | GuardFailure> {
  const user = await currentUser();
  if (!user) {
    return unauthorized();
  }
  if (user.role !== "SYSTEM_OWNER") {
    return forbidden();
  }
  return { ok: true, user };
}

export async function requireAdmin(): Promise<AdminSuccess | GuardFailure> {
  const user = await currentUser();
  if (!user) {
    return unauthorized();
  }
  if (user.role !== "BUSINESS_ADMIN" || !user.businessId) {
    return forbidden();
  }

  const business = await prisma.business.findUnique({
    where: { id: user.businessId },
  });

  if (!business || business.status === "DISABLED") {
    return disabled();
  }

  return { ok: true, user, businessId: user.businessId, business };
}
