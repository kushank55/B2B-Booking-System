import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export function overlappingAppointmentWhere(
  staffId: string,
  startAt: Date,
  endAt: Date,
) {
  return {
    staffId,
    status: { not: "CANCELLED" as const },
    startAt: { lt: endAt },
    endAt: { gt: startAt },
  };
}

export function findOverlappingAppointment(
  db: Db,
  staffId: string,
  startAt: Date,
  endAt: Date,
) {
  return db.appointment.findFirst({
    where: overlappingAppointmentWhere(staffId, startAt, endAt),
  });
}
