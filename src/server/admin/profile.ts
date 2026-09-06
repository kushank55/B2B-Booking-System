import { prisma } from "@/lib/prisma";

export type ProfileInput = {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  timezone: string;
};

export function validateProfile(input: ProfileInput) {
  if (!input.name.trim()) {
    return "Business name is required.";
  }
  if (!input.contactEmail.includes("@")) {
    return "A valid contact email is required.";
  }
  if (!input.timezone.trim()) {
    return "Timezone is required.";
  }
  return null;
}

export async function updateOwnProfile(businessId: string, input: ProfileInput) {
  const error = validateProfile(input);
  if (error) {
    return { error };
  }

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: input.name.trim(),
      contactEmail: input.contactEmail.trim().toLowerCase(),
      contactPhone: input.contactPhone?.trim() || null,
      timezone: input.timezone,
    },
  });

  return { business };
}
