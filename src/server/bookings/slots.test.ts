import { describe, expect, it } from "vitest";
import { generateSlots } from "@/server/bookings/slots";
import { formatTimeInZone, zonedLocalToUtc } from "@/server/bookings/time";

const timezone = "America/New_York";
const date = "2026-10-05";
const now = new Date("2026-09-01T00:00:00.000Z");
const rules = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "11:00", staffId: null },
];

describe("generateSlots", () => {
  it("returns starts that fit inside the working window", () => {
    const slots = generateSlots({
      durationMinutes: 30,
      date,
      timezone,
      staffId: "staff-a",
      rules,
      appointments: [],
      now,
    });

    expect(slots.map((slot) => formatTimeInZone(slot, timezone))).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ]);
  });

  it("removes a slot that overlaps a confirmed appointment for the same staff", () => {
    const slots = generateSlots({
      durationMinutes: 30,
      date,
      timezone,
      staffId: "staff-a",
      rules,
      appointments: [
        {
          staffId: "staff-a",
          startAt: zonedLocalToUtc(date, "09:30", timezone),
          endAt: zonedLocalToUtc(date, "10:00", timezone),
          status: "CONFIRMED",
        },
      ],
      now,
    });

    expect(slots.map((slot) => formatTimeInZone(slot, timezone))).toEqual([
      "09:00",
      "10:00",
      "10:30",
    ]);
  });

  it("does not let a cancelled appointment block a slot", () => {
    const slots = generateSlots({
      durationMinutes: 30,
      date,
      timezone,
      staffId: "staff-a",
      rules,
      appointments: [
        {
          staffId: "staff-a",
          startAt: zonedLocalToUtc(date, "09:30", timezone),
          endAt: zonedLocalToUtc(date, "10:00", timezone),
          status: "CANCELLED",
        },
      ],
      now,
    });

    expect(slots.map((slot) => formatTimeInZone(slot, timezone))).toContain(
      "09:30",
    );
  });

  it("lets a different staff member take the same time", () => {
    const slots = generateSlots({
      durationMinutes: 30,
      date,
      timezone,
      staffId: "staff-b",
      rules,
      appointments: [
        {
          staffId: "staff-a",
          startAt: zonedLocalToUtc(date, "09:00", timezone),
          endAt: zonedLocalToUtc(date, "09:30", timezone),
          status: "CONFIRMED",
        },
      ],
      now,
    });

    expect(slots.map((slot) => formatTimeInZone(slot, timezone))).toContain(
      "09:00",
    );
  });

  it("rejects slots in the past", () => {
    const slots = generateSlots({
      durationMinutes: 30,
      date,
      timezone,
      staffId: "staff-a",
      rules,
      appointments: [],
      now: zonedLocalToUtc(date, "10:15", timezone),
    });

    expect(slots.map((slot) => formatTimeInZone(slot, timezone))).toEqual([
      "10:30",
    ]);
  });
});
