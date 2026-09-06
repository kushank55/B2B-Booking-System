import { getAppointmentByToken } from "@/server/bookings/create";
import { formatDateTimeInZone } from "@/server/bookings/time";
import { cancelBooking } from "./actions";
import { notFound } from "next/navigation";

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const appointment = await getAppointmentByToken(token);

  if (!appointment) {
    notFound();
  }

  const when = formatDateTimeInZone(
    appointment.startAt,
    appointment.business.timezone,
  );
  const canCancel =
    appointment.status === "CONFIRMED" && appointment.startAt > new Date();

  return (
    <main className="content content-narrow">
      <h1>
        {query.confirmed ? "Booking confirmed" : "Your appointment"}
      </h1>
      <p className="muted">
        Keep this page or save the link. It is how you view or cancel this
        booking.
      </p>

      {query.error ? <p className="error">{query.error}</p> : null}

      <section className="card stack">
        <p>
          <strong>{appointment.business.name}</strong>
        </p>
        <p>{appointment.service.name}</p>
        <p>{when}</p>
        <p className="muted">with {appointment.staff.name}</p>
        <p>
          {appointment.customerName} · {appointment.customerEmail}
          {appointment.customerPhone ? ` · ${appointment.customerPhone}` : ""}
        </p>
        <p>
          <span className={`badge badge-${appointment.status.toLowerCase()}`}>
            {appointment.status}
          </span>
        </p>
      </section>

      {canCancel ? (
        <form action={cancelBooking} className="card stack">
          <input type="hidden" name="token" value={token} />
          <p className="muted">
            Cancelling frees this time for someone else.
          </p>
          <button type="submit" className="button-danger">
            Cancel appointment
          </button>
        </form>
      ) : null}
    </main>
  );
}
