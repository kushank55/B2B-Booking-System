import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createBooking } from "@/server/bookings/create";
import { getSlotsForSlug } from "@/server/bookings/availability";
import { getAppointmentForTenant } from "@/server/admin/appointments";

const SLUG = "vitest-lab";
const DATE = "2026-10-05";

async function resetLab() {
  const existing = await prisma.business.findUnique({ where: { slug: SLUG } });
  if (existing) {
    await prisma.appointment.deleteMany({ where: { businessId: existing.id } });
    await prisma.availabilityRule.deleteMany({
      where: { businessId: existing.id },
    });
    await prisma.service.deleteMany({ where: { businessId: existing.id } });
    await prisma.staff.deleteMany({ where: { businessId: existing.id } });
    await prisma.business.delete({ where: { id: existing.id } });
  }
}

async function seedLab() {
  await resetLab();

  const business = await prisma.business.create({
    data: {
      name: "Vitest Lab",
      slug: SLUG,
      contactEmail: "lab@vitest.demo",
      timezone: "America/New_York",
      status: "ACTIVE",
      services: {
        create: [
          { name: "Haircut", durationMinutes: 30, status: "ACTIVE" },
          { name: "Consult", durationMinutes: 30, status: "INACTIVE" },
        ],
      },
      staff: {
        create: [{ name: "Alex" }, { name: "Blair" }],
      },
    },
    include: { services: true, staff: true },
  });

  await prisma.availabilityRule.createMany({
    data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      businessId: business.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
    })),
  });

  return {
    business,
    haircut: business.services.find((service) => service.name === "Haircut")!,
    consult: business.services.find((service) => service.name === "Consult")!,
    alex: business.staff.find((person) => person.name === "Alex")!,
    blair: business.staff.find((person) => person.name === "Blair")!,
  };
}

async function firstSlot(serviceId: string, staffId: string) {
  const result = await getSlotsForSlug({
    slug: SLUG,
    serviceId,
    date: DATE,
    staffId,
  });
  if (!("slots" in result) || result.slots.length === 0) {
    throw new Error("Expected bookable slots for the lab tenant");
  }
  return result.slots[0];
}

describe("createBooking", () => {
  let lab: Awaited<ReturnType<typeof seedLab>>;

  beforeEach(async () => {
    lab = await seedLab();
  });

  afterAll(async () => {
    await resetLab();
    await prisma.$disconnect();
  });

  it("accepts a valid slot", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const result = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    expect(result.error).toBeUndefined();
    expect(result.appointment?.status).toBe("CONFIRMED");
  });

  it("rejects an overlapping slot for the same staff", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const first = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });
    expect(first.appointment).toBeTruthy();

    const second = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Drew",
      customerEmail: "drew@example.com",
    });

    expect(second.status).toBe(409);
    expect(second.error).toMatch(/not available|just booked/i);
  });

  it("rejects a concurrent double-book of the same staff slot", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const payload = {
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
    };

    const results = await Promise.all([
      createBooking({
        ...payload,
        customerName: "One",
        customerEmail: "one@example.com",
      }),
      createBooking({
        ...payload,
        customerName: "Two",
        customerEmail: "two@example.com",
      }),
    ]);

    const accepted = results.filter((result) => result.appointment);
    const rejected = results.filter((result) => result.status === 409);

    expect(accepted).toHaveLength(1);
    expect(rejected.length).toBeGreaterThanOrEqual(1);
  });

  it("does not let a cancelled appointment block the same slot", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const first = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    await prisma.appointment.update({
      where: { id: first.appointment!.id },
      data: { status: "CANCELLED" },
    });

    const second = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Drew",
      customerEmail: "drew@example.com",
    });

    expect(second.appointment?.status).toBe("CONFIRMED");
  });

  it("lets a different staff member take the same time", async () => {
    const alexSlot = await firstSlot(lab.haircut.id, lab.alex.id);
    await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: alexSlot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    const blairSlot = await firstSlot(lab.haircut.id, lab.blair.id);
    const sameTime = blairSlot.startAt === alexSlot.startAt;
    expect(sameTime).toBe(true);

    const second = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.blair.id,
      startAt: blairSlot.startAt,
      customerName: "Drew",
      customerEmail: "drew@example.com",
    });

    expect(second.appointment?.status).toBe("CONFIRMED");
  });

  it("rejects an inactive service", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const result = await createBooking({
      slug: SLUG,
      serviceId: lab.consult.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    expect(result.status).toBe(404);
  });

  it("rejects a disabled business", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    await prisma.business.update({
      where: { id: lab.business.id },
      data: { status: "DISABLED" },
    });

    const result = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    expect(result.status).toBe(404);
  });

  it("rejects a past slot", async () => {
    const result = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: "2020-01-06T14:00:00.000Z",
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    expect(result.status).toBe(409);
  });

  it("does not let tenant A read tenant B's appointment by id", async () => {
    const slot = await firstSlot(lab.haircut.id, lab.alex.id);
    const booking = await createBooking({
      slug: SLUG,
      serviceId: lab.haircut.id,
      staffId: lab.alex.id,
      startAt: slot.startAt,
      customerName: "Casey",
      customerEmail: "casey@example.com",
    });

    const other = await prisma.business.create({
      data: {
        name: "Other Shop",
        slug: `${SLUG}-other`,
        contactEmail: "other@vitest.demo",
        timezone: "America/New_York",
      },
    });

    const leaked = await getAppointmentForTenant(
      other.id,
      booking.appointment!.id,
    );
    expect(leaked).toBeNull();

    await prisma.business.delete({ where: { id: other.id } });
  });
});
