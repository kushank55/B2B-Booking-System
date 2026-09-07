import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSlotsForSlug } from "@/server/bookings/availability";
import { findOverlappingAppointment } from "@/server/bookings/conflicts";
import { dateInZone } from "@/server/bookings/time";
import { getActiveBusinessBySlug } from "@/server/tenants/active";

export type CreateBookingInput = {
  slug: string;
  serviceId: string;
  staffId: string;
  startAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
};

export function validateBookingInput(input: CreateBookingInput) {
  if (!input.customerName.trim()) {
    return "Name is required.";
  }
  if (!input.customerEmail.includes("@")) {
    return "A valid email is required.";
  }
  if (!input.serviceId || !input.staffId || !input.startAt) {
    return "Service, staff, and a time slot are required.";
  }
  if (Number.isNaN(new Date(input.startAt).getTime())) {
    return "The selected time is not valid.";
  }
  return null;
}

export async function createBooking(input: CreateBookingInput) {
  const error = validateBookingInput(input);
  if (error) {
    return { error, status: 400 };
  }

  const business = await getActiveBusinessBySlug(input.slug);
  if (!business) {
    return { error: "This business is not available.", status: 404 };
  }

  const startAt = new Date(input.startAt);
  const date = dateInZone(startAt, business.timezone);
  const slots = await getSlotsForSlug({
    slug: input.slug,
    serviceId: input.serviceId,
    date,
    staffId: input.staffId,
  });

  if ("error" in slots && slots.error) {
    return { error: slots.error, status: slots.status };
  }

  const chosen =
    "slots" in slots
      ? slots.slots.find((slot) => slot.startAt === startAt.toISOString())
      : undefined;

  if (!chosen) {
    return {
      error: "That time is not available. Choose another slot.",
      status: 409,
    };
  }

  const endAt = new Date(chosen.endAt);

  try {
    const appointment = await prisma.$transaction(
      async (tx) => {
        const overlap = await findOverlappingAppointment(
          tx,
          input.staffId,
          startAt,
          endAt,
        );

        if (overlap) {
          throw new Error("CONFLICT");
        }

        return tx.appointment.create({
          data: {
            businessId: business.id,
            serviceId: input.serviceId,
            staffId: input.staffId,
            customerName: input.customerName.trim(),
            customerEmail: input.customerEmail.trim().toLowerCase(),
            customerPhone: input.customerPhone?.trim() || null,
            startAt,
            endAt,
            status: "CONFIRMED",
            manageToken: randomBytes(24).toString("hex"),
          },
          include: {
            service: true,
            staff: true,
            business: true,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return { appointment };
  } catch (cause) {
    const code =
      cause && typeof cause === "object" && "code" in cause
        ? String(cause.code)
        : "";
    if (
      (cause instanceof Error && cause.message === "CONFLICT") ||
      code === "P2034"
    ) {
      return {
        error: "That time was just booked. Choose another slot.",
        status: 409,
      };
    }
    throw cause;
  }
}

export function getAppointmentByToken(token: string) {
  return prisma.appointment.findUnique({
    where: { manageToken: token },
    include: {
      service: true,
      staff: true,
      business: true,
    },
  });
}

export async function cancelAppointmentByToken(token: string) {
  const appointment = await getAppointmentByToken(token);
  if (!appointment) {
    return { error: "Not found.", status: 404 };
  }
  if (appointment.status !== "CONFIRMED") {
    return { error: "This booking can no longer be cancelled.", status: 400 };
  }
  if (appointment.startAt <= new Date()) {
    return { error: "Past bookings cannot be cancelled.", status: 400 };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
    include: {
      service: true,
      staff: true,
      business: true,
    },
  });

  return { appointment: updated };
}
