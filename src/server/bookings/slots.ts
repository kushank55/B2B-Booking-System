import {
  dayOfWeekInZone,
  minutesToTime,
  timeToMinutes,
  zonedLocalToUtc,
} from "@/server/bookings/time";

export type SlotRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  staffId: string | null;
};

export type SlotAppointment = {
  staffId: string;
  startAt: Date;
  endAt: Date;
  status: string;
};

export type GenerateSlotsInput = {
  durationMinutes: number;
  date: string;
  timezone: string;
  staffId: string;
  rules: SlotRule[];
  appointments: SlotAppointment[];
  now?: Date;
};

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function rulesForDay(rules: SlotRule[], staffId: string, dayOfWeek: number) {
  const hasStaffHours = rules.some((rule) => rule.staffId === staffId);
  return rules.filter((rule) => {
    if (rule.dayOfWeek !== dayOfWeek) {
      return false;
    }
    return hasStaffHours ? rule.staffId === staffId : rule.staffId === null;
  });
}

export function generateSlots(input: GenerateSlotsInput) {
  const now = input.now ?? new Date();
  const dayOfWeek = dayOfWeekInZone(input.date, input.timezone);
  const windows = rulesForDay(input.rules, input.staffId, dayOfWeek);
  const blocking = input.appointments.filter(
    (appointment) =>
      appointment.staffId === input.staffId &&
      appointment.status !== "CANCELLED",
  );

  const starts: Date[] = [];

  for (const window of windows) {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    if (windowEnd <= windowStart) {
      continue;
    }

    for (
      let startMinutes = windowStart;
      startMinutes + input.durationMinutes <= windowEnd;
      startMinutes += input.durationMinutes
    ) {
      const startAt = zonedLocalToUtc(
        input.date,
        minutesToTime(startMinutes),
        input.timezone,
      );
      const endAt = new Date(
        startAt.getTime() + input.durationMinutes * 60_000,
      );

      if (startAt < now) {
        continue;
      }

      const overlaps = blocking.some((appointment) =>
        rangesOverlap(startAt, endAt, appointment.startAt, appointment.endAt),
      );

      if (!overlaps) {
        starts.push(startAt);
      }
    }
  }

  return starts.sort((a, b) => a.getTime() - b.getTime());
}
