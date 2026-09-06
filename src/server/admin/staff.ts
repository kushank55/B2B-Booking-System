import type { StaffStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StaffInput = {
  name: string;
  email?: string;
  status?: StaffStatus;
};

export function validateStaff(input: StaffInput) {
  if (!input.name.trim()) {
    return "Staff name is required.";
  }
  if (input.email && !input.email.includes("@")) {
    return "A valid staff email is required.";
  }
  return null;
}

export function listStaff(businessId: string) {
  return prisma.staff.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export function getStaffForTenant(businessId: string, id: string) {
  return prisma.staff.findFirst({
    where: { id, businessId },
  });
}

export async function createStaff(businessId: string, input: StaffInput) {
  const error = validateStaff(input);
  if (error) {
    return { error };
  }

  const staff = await prisma.staff.create({
    data: {
      businessId,
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      status: input.status ?? "ACTIVE",
    },
  });

  return { staff };
}

export async function updateStaff(
  businessId: string,
  id: string,
  input: StaffInput,
) {
  const existing = await getStaffForTenant(businessId, id);
  if (!existing) {
    return { error: "Not found." };
  }

  const error = validateStaff(input);
  if (error) {
    return { error };
  }

  const staff = await prisma.staff.update({
    where: { id: existing.id },
    data: {
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      status: input.status ?? existing.status,
    },
  });

  return { staff };
}
