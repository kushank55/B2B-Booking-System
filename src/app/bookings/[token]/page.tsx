import { PublicFrame } from "@/components/public-frame";
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
    <PublicFrame>
      <main className="content content-narrow">
        <h1>
          {query.confirmed ? "Booking confirmed" : "Your appointment"}
        </h1>
        <p className="muted lede">
          Keep this page or save the link. It is how you view or cancel this
          booking.
        </p>

        {query.confirmed ? (
          <p className="notice notice-ok">Your appointment is confirmed.</p>
        ) : null}
        {query.error ? <p className="error">{query.error}</p> : null}

        <section className="card stack">
          <div className="detail-row">
            <strong>Business</strong>
            <p>{appointment.business.name}</p>
          </div>
          <div className="detail-row">
            <strong>Service</strong>
            <p>{appointment.service.name}</p>
          </div>
          <div className="detail-row">
            <strong>When</strong>
            <p>{when}</p>
          </div>
          <div className="detail-row">
            <strong>Staff</strong>
            <p>{appointment.staff.name}</p>
          </div>
          <div className="detail-row">
            <strong>Customer</strong>
            <p>
              {appointment.customerName} · {appointment.customerEmail}
              {appointment.customerPhone ? ` · ${appointment.customerPhone}` : ""}
            </p>
          </div>
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
    </PublicFrame>
  );
}
