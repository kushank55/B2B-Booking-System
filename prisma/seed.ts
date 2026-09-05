import { hash } from "bcryptjs";
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "AdminDemo123!";
const OWNER_PASSWORD = "OwnerDemo123!";

const weekdayHours = (businessId: string): Prisma.AvailabilityRuleCreateManyInput[] =>
  [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    businessId,
    dayOfWeek,
    startTime: "09:00",
    endTime: "17:00",
  }));

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  const [ownerPasswordHash, adminPasswordHash] = await Promise.all([
    hash(OWNER_PASSWORD, 10),
    hash(DEMO_PASSWORD, 10),
  ]);

  await prisma.user.create({
    data: {
      email: "owner@demo.com",
      passwordHash: ownerPasswordHash,
      name: "Platform Owner",
      role: "SYSTEM_OWNER",
    },
  });

  const brightSmiles = await prisma.business.create({
    data: {
      name: "Bright Smiles Dental",
      slug: "bright-smiles",
      contactEmail: "hello@bright-smiles.demo",
      contactPhone: "555-0100",
      timezone: "America/New_York",
      status: "ACTIVE",
      users: {
        create: {
          email: "admin@bright-smiles.demo",
          passwordHash: adminPasswordHash,
          name: "Priya Shah",
          role: "BUSINESS_ADMIN",
        },
      },
      staff: {
        create: {
          name: "Dr. Maya Chen",
          email: "maya@bright-smiles.demo",
        },
      },
      services: {
        create: [
          {
            name: "Teeth Cleaning",
            durationMinutes: 30,
            description: "Routine hygiene visit",
          },
          {
            name: "New Patient Exam",
            durationMinutes: 60,
            description: "First visit exam and consult",
          },
        ],
      },
    },
  });

  const northside = await prisma.business.create({
    data: {
      name: "Northside Barbers",
      slug: "northside-barbers",
      contactEmail: "hello@northside.demo",
      contactPhone: "555-0142",
      timezone: "America/Chicago",
      status: "ACTIVE",
      users: {
        create: {
          email: "admin@northside.demo",
          passwordHash: adminPasswordHash,
          name: "James Cole",
          role: "BUSINESS_ADMIN",
        },
      },
      staff: {
        create: {
          name: "Alex Rivera",
          email: "alex@northside.demo",
        },
      },
      services: {
        create: {
          name: "Haircut",
          durationMinutes: 30,
        },
      },
    },
  });

  await prisma.availabilityRule.createMany({
    data: [...weekdayHours(brightSmiles.id), ...weekdayHours(northside.id)],
  });

  console.log("Seeded:");
  console.log("  SYSTEM_OWNER: owner@demo.com / OwnerDemo123!");
  console.log("  BUSINESS_ADMIN: admin@bright-smiles.demo / AdminDemo123!");
  console.log("  BUSINESS_ADMIN: admin@northside.demo / AdminDemo123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
