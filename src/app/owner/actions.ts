"use server";

import { requireOwner } from "@/server/auth/guards";
import {
  createBusinessWithAdmin,
  setBusinessStatus,
} from "@/server/tenants/service";
import { redirect } from "next/navigation";
import type { BusinessStatus } from "@prisma/client";

export type FormState = { error: string } | undefined;

export async function onboardBusiness(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const owner = await requireOwner();
  if (!owner.ok) {
    return { error: "You must be signed in as the System Owner." };
  }

  const created = await createBusinessWithAdmin({
    name: String(formData.get("name") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? "") || undefined,
    timezone: String(formData.get("timezone") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    status:
      String(formData.get("status") ?? "ACTIVE") === "DISABLED"
        ? "DISABLED"
        : "ACTIVE",
    adminName: String(formData.get("adminName") ?? ""),
    adminEmail: String(formData.get("adminEmail") ?? ""),
    adminPassword: String(formData.get("adminPassword") ?? ""),
  });

  if (created.error || !created.business) {
    return { error: created.error ?? "Could not create the business." };
  }

  redirect(`/owner/businesses/${created.business.id}`);
}

export async function updateBusinessStatus(formData: FormData) {
  const owner = await requireOwner();
  if (!owner.ok) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BusinessStatus;

  if (!id || (status !== "ACTIVE" && status !== "DISABLED")) {
    return;
  }

  await setBusinessStatus(id, status);
  redirect(`/owner/businesses/${id}`);
}
