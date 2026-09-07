import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { zonedLocalToUtc } from "@/server/bookings/time";

export type AppointmentFilters = {
  date?: string;
  status?: AppointmentStatus | "";
};

function nextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

export function getAppointmentForTenant(businessId: string, id: string) {
  return prisma.appointment.findFirst({
    where: { id, businessId },
    include: {
      service: true,
      staff: true,
    },
  });
}

export function listAppointments(
  businessId: string,
  timezone: string,
  filters: AppointmentFilters,
) {
  return prisma.appointment.findMany({
    where: {
      businessId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)
        ? {
            startAt: {
              gte: zonedLocalToUtc(filters.date, "00:00", timezone),
              lt: zonedLocalToUtc(nextDate(filters.date), "00:00", timezone),
            },
          }
        : {}),
    },
    include: {
      service: true,
      staff: true,
    },
    orderBy: { startAt: "asc" },
  });
}

export function canTransition(
  current: AppointmentStatus,
  next: AppointmentStatus,
) {
  return (
    current === "CONFIRMED" &&
    (next === "CANCELLED" || next === "COMPLETED")
  );
}

export async function updateAppointmentStatus(
  businessId: string,
  id: string,
  status: AppointmentStatus,
) {
  const existing = await getAppointmentForTenant(businessId, id);
  if (!existing) {
    return { error: "Not found." };
  }

  if (!canTransition(existing.status, status)) {
    return { error: "That status change is not allowed." };
  }

  const appointment = await prisma.appointment.update({
    where: { id: existing.id },
    data: { status },
    include: {
      service: true,
      staff: true,
    },
  });

  return { appointment };
}
