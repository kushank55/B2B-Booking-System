"use server";

import { requireAdmin } from "@/server/auth/guards";
import { updateOwnProfile } from "@/server/admin/profile";
import { createService, updateService } from "@/server/admin/services";
import { createStaff, updateStaff } from "@/server/admin/staff";
import { redirect } from "next/navigation";

export type FormState = { error: string } | undefined;

export async function saveProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: "You must be signed in as a Business Admin." };
  }

  const updated = await updateOwnProfile(admin.businessId, {
    name: String(formData.get("name") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? "") || undefined,
    timezone: String(formData.get("timezone") ?? ""),
  });

  if (updated.error) {
    return { error: updated.error };
  }

  redirect("/admin");
}

export async function saveService(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: "You must be signed in as a Business Admin." };
  }

  const id = String(formData.get("id") ?? "");
  const input = {
    name: String(formData.get("name") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes")),
    status:
      String(formData.get("status") ?? "ACTIVE") === "INACTIVE"
        ? ("INACTIVE" as const)
        : ("ACTIVE" as const),
  };

  const result = id
    ? await updateService(admin.businessId, id, input)
    : await createService(admin.businessId, input);

  if (result.error) {
    return { error: result.error };
  }

  redirect("/admin/services");
}

export async function saveStaff(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: "You must be signed in as a Business Admin." };
  }

  const id = String(formData.get("id") ?? "");
  const input = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "") || undefined,
    status:
      String(formData.get("status") ?? "ACTIVE") === "INACTIVE"
        ? ("INACTIVE" as const)
        : ("ACTIVE" as const),
  };

  const result = id
    ? await updateStaff(admin.businessId, id, input)
    : await createStaff(admin.businessId, input);

  if (result.error) {
    return { error: result.error };
  }

  redirect("/admin/staff");
}
