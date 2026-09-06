import { hash } from "bcryptjs";
import type { BusinessStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/server/tenants/slug";

export type CreateBusinessInput = {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  timezone: string;
  slug?: string;
  status?: BusinessStatus;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
};

export function validateCreateBusiness(input: CreateBusinessInput) {
  if (!input.name.trim()) {
    return "Business name is required.";
  }
  if (!input.contactEmail.includes("@")) {
    return "A valid business contact email is required.";
  }
  if (!input.timezone.trim()) {
    return "Timezone is required.";
  }
  if (!input.adminName.trim()) {
    return "Admin name is required.";
  }
  if (!input.adminEmail.includes("@")) {
    return "A valid admin email is required.";
  }
  if (input.adminPassword.length < 8) {
    return "Admin password must be at least 8 characters.";
  }
  return null;
}

async function uniqueSlug(base: string) {
  let slug = base;
  let suffix = 2;

  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function listBusinesses() {
  return prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true } },
    },
  });
}

export function getBusiness(id: string) {
  return prisma.business.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "BUSINESS_ADMIN" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
  });
}

export async function createBusinessWithAdmin(input: CreateBusinessInput) {
  const error = validateCreateBusiness(input);
  if (error) {
    return { error };
  }

  const requestedSlug = input.slug?.trim()
    ? slugify(input.slug)
    : slugify(input.name);

  if (!requestedSlug) {
    return { error: "Could not create a URL slug from that name." };
  }

  const adminEmail = input.adminEmail.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    return { error: "That admin email is already in use." };
  }

  const slug = await uniqueSlug(requestedSlug);
  const passwordHash = await hash(input.adminPassword, 10);

  const business = await prisma.business.create({
    data: {
      name: input.name.trim(),
      slug,
      contactEmail: input.contactEmail.trim().toLowerCase(),
      contactPhone: input.contactPhone?.trim() || null,
      timezone: input.timezone,
      status: input.status ?? "ACTIVE",
      users: {
        create: {
          name: input.adminName.trim(),
          email: adminEmail,
          passwordHash,
          role: "BUSINESS_ADMIN",
        },
      },
    },
  });

  return { business };
}

export async function setBusinessStatus(id: string, status: BusinessStatus) {
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Business not found." };
  }

  const business = await prisma.business.update({
    where: { id },
    data: { status },
  });

  return { business };
}
