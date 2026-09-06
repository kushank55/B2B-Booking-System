import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/server/bookings/slots";
import { formatTimeInZone, isValidTime, timeToMinutes } from "@/server/bookings/time";
import { getActiveBusinessBySlug } from "@/server/tenants/active";

export const WEEK_DAYS = [
  { dayOfWeek: 0, label: "Sunday" },
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
] as const;

export type WeekDayHours = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function listAvailability(businessId: string, staffId: string | null) {
  return prisma.availabilityRule.findMany({
    where: { businessId, staffId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export function validateWeekHours(days: WeekDayHours[]) {
  for (const day of days) {
    if (day.dayOfWeek < 0 || day.dayOfWeek > 6) {
      return "Each day must be Sunday through Saturday.";
    }
    if (!isValidTime(day.startTime) || !isValidTime(day.endTime)) {
      return "Hours must use 24-hour HH:mm times.";
    }
    if (timeToMinutes(day.endTime) <= timeToMinutes(day.startTime)) {
      return "End time must be after start time.";
    }
  }
  return null;
}

export async function replaceAvailability(
  businessId: string,
  staffId: string | null,
  days: WeekDayHours[],
) {
  const error = validateWeekHours(days);
  if (error) {
    return { error };
  }

  if (staffId) {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) {
      return { error: "Not found." };
    }
  }

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({
      where: { businessId, staffId },
    }),
    prisma.availabilityRule.createMany({
      data: days.map((day) => ({
        businessId,
        staffId,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
      })),
    }),
  ]);

  return { ok: true as const };
}

export async function getSlotsForSlug(input: {
  slug: string;
  serviceId: string;
  date: string;
  staffId?: string;
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: "Date must be YYYY-MM-DD.", status: 400 };
  }

  const business = await getActiveBusinessBySlug(input.slug);
  if (!business) {
    return { error: "This business is not available.", status: 404 };
  }

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, businessId: business.id },
  });
  if (!service || service.status !== "ACTIVE") {
    return { error: "Not found.", status: 404 };
  }

  const activeStaff = await prisma.staff.findMany({
    where: { businessId: business.id, status: "ACTIVE" },
  });

  const staff =
    input.staffId != null && input.staffId !== ""
      ? activeStaff.find((person) => person.id === input.staffId)
      : activeStaff.length === 1
        ? activeStaff[0]
        : undefined;

  if (!staff) {
    return {
      error: input.staffId
        ? "Not found."
        : "Choose a staff member.",
      status: input.staffId ? 404 : 400,
    };
  }

  const dayStart = new Date(`${input.date}T00:00:00.000Z`);
  const dayEnd = new Date(`${input.date}T23:59:59.999Z`);

  const [rules, appointments] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: { businessId: business.id },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        staffId: staff.id,
        status: { not: "CANCELLED" },
        startAt: { lt: new Date(dayEnd.getTime() + 24 * 60 * 60 * 1000) },
        endAt: { gt: new Date(dayStart.getTime() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const starts = generateSlots({
    durationMinutes: service.durationMinutes,
    date: input.date,
    timezone: business.timezone,
    staffId: staff.id,
    rules,
    appointments,
  });

  return {
    slots: starts.map((startAt) => {
      const endAt = new Date(
        startAt.getTime() + service.durationMinutes * 60_000,
      );
      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        localTime: formatTimeInZone(startAt, business.timezone),
      };
    }),
    timezone: business.timezone,
    staffId: staff.id,
    serviceId: service.id,
  };
}
