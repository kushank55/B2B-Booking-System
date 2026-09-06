"use server";

import { cancelAppointmentByToken } from "@/server/bookings/create";
import { redirect } from "next/navigation";

export async function cancelBooking(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const result = await cancelAppointmentByToken(token);

  if (result.error) {
    redirect(`/bookings/${token}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/bookings/${token}`);
}
