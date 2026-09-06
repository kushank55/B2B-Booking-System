import { prisma } from "@/lib/prisma";

export async function getActiveBusinessBySlug(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business || business.status !== "ACTIVE") {
    return null;
  }

  return business;
}
