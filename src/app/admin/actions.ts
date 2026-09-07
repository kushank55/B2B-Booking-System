"use server";

import { requireAdmin } from "@/server/auth/guards";
import { updateOwnProfile } from "@/server/admin/profile";
import { createService, updateService } from "@/server/admin/services";
import { createStaff, updateStaff } from "@/server/admin/staff";
import { replaceAvailability } from "@/server/bookings/availability";
import { updateAppointmentStatus } from "@/server/admin/appointments";
import { redirect } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";

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

export async function saveHours(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: "You must be signed in as a Business Admin." };
  }

  const staffId = String(formData.get("staffId") ?? "") || null;
  const days = [0, 1, 2, 3, 4, 5, 6].flatMap((dayOfWeek) => {
    const open = formData.get(`open-${dayOfWeek}`) === "on";
    if (!open) {
      return [];
    }
    return [
      {
        dayOfWeek,
        startTime: String(formData.get(`start-${dayOfWeek}`) ?? "").slice(0, 5),
        endTime: String(formData.get(`end-${dayOfWeek}`) ?? "").slice(0, 5),
      },
    ];
  });

  const saved = await replaceAvailability(admin.businessId, staffId, days);
  if (saved.error) {
    return { error: saved.error };
  }

  redirect(staffId ? `/admin/hours?staffId=${staffId}` : "/admin/hours");
}

export async function updateAppointment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;
  const returnTo = String(formData.get("returnTo") ?? "/admin/appointments");

  if (!id || (status !== "CANCELLED" && status !== "COMPLETED")) {
    redirect("/admin/appointments");
  }

  await updateAppointmentStatus(admin.businessId, id, status);
  redirect(returnTo);
}
