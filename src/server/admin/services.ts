import type { ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ServiceInput = {
  name: string;
  durationMinutes: number;
  status?: ServiceStatus;
};

export function validateService(input: ServiceInput) {
  if (!input.name.trim()) {
    return "Service name is required.";
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    return "Duration must be a positive number of minutes.";
  }
  return null;
}

export function listServices(businessId: string) {
  return prisma.service.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export function getServiceForTenant(businessId: string, id: string) {
  return prisma.service.findFirst({
    where: { id, businessId },
  });
}

export async function createService(businessId: string, input: ServiceInput) {
  const error = validateService(input);
  if (error) {
    return { error };
  }

  const service = await prisma.service.create({
    data: {
      businessId,
      name: input.name.trim(),
      durationMinutes: input.durationMinutes,
      status: input.status ?? "ACTIVE",
    },
  });

  return { service };
}

export async function updateService(
  businessId: string,
  id: string,
  input: ServiceInput,
) {
  const existing = await getServiceForTenant(businessId, id);
  if (!existing) {
    return { error: "Not found." };
  }

  const error = validateService(input);
  if (error) {
    return { error };
  }

  const service = await prisma.service.update({
    where: { id: existing.id },
    data: {
      name: input.name.trim(),
      durationMinutes: input.durationMinutes,
      status: input.status ?? existing.status,
    },
  });

  return { service };
}
