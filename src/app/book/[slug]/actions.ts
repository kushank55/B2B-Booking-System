"use server";

import { createBooking } from "@/server/bookings/create";
import { redirect } from "next/navigation";

export type BookingFormState = { error: string } | undefined;

export async function submitBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const result = await createBooking({
    slug: String(formData.get("slug") ?? ""),
    serviceId: String(formData.get("serviceId") ?? ""),
    staffId: String(formData.get("staffId") ?? ""),
    startAt: String(formData.get("startAt") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? "") || undefined,
  });

  if (result.error || !result.appointment) {
    return { error: result.error ?? "Could not create booking." };
  }

  redirect(`/bookings/${result.appointment.manageToken}?confirmed=1`);
}
